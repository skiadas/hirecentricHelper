/**
 * @module preload
 */

import fetch from 'node-fetch';
import {parse} from 'node-html-parser';
import {ipcRenderer} from 'electron';
import * as fs from 'node:fs';
import * as nodePath from 'node:path';

const baseUrl = 'https://admin.hirecentric.com';
let setcookie = '';

function makeLink(parts: Array<string>, query?: object) {
  let url = baseUrl + '/' + parts.join('/');
  if (query) {
    url +=
      '?' +
      Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
  }
  return url;
}

/**
 * Attempt to log in with the given credentials. Return true if the effort
 * was successful.
 */
export async function loginWithCredentials(username: string, password: string) {
  const cookie = (await fetch(baseUrl)).headers.get('set-cookie')?.split(';')[0];
  if (cookie) {
    setcookie = cookie;
  }
  const body = `url=&username=${username}&password=${password}&submit=Log+In`;
  const loginResult = await getData(makeLink(['index.php']), 'post', body);
  const forgotMessage = parse(loginResult).querySelector('[href="forgot_password.php"]');
  return forgotMessage == null;
}

export async function getSearches(showInactive: boolean) {
  const params: {[key: string]: string} = {n: 'manager', f: 'tab'};
  if (showInactive) {
    params.f = 'showInactive';
  }
  const data = await getData(makeLink(['manager', 'view.php'], params), 'get');
  const doc = parse(data);
  const titles = doc
    .querySelectorAll('tr.odd_tr, tr.even_tr')
    .map(el => el.querySelector('td a')?.textContent);
  const ids = doc
    .querySelectorAll('tr')
    .filter(el => el.id)
    .map(el => el.id.replace(/\D+/, ''));
  return ids.map((id, index) => ({id, title: titles[index] ?? ''}));
}

async function getData(url: string, method: 'post' | 'get', body?: string) {
  console.log(`LOG: fetching ${method}: ${url}`);
  const headers: {[key: string]: string} = {Cookie: setcookie};
  const options = {method, body, headers};
  if (body) {
    headers['Content-Length'] = String(body.length);
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  const results = await fetch(url, options);
  return await results.text();
}

export async function getDataForSearch(searchId: string) {
  const applicantPage = await getData(
    makeLink(['viewapplicants', 'view.php'], {
      n: 'jobListings',
      f: 'reportRefresh',
      v: `1-${searchId}`,
      submitted_at: 5,
      is_disqualified: 1,
      completion_level: 0,
      sort: 'a.submitted_at%20DESC',
    }),
    'get',
  );
  const root = parse(applicantPage);
  const applicantRows = root.querySelectorAll(`#applicants_info_${searchId} tr`);
  const actualApplicantRows = applicantRows.filter(
    row => row.classList.contains('odd_tr') || row.classList.contains('even_tr'),
  );
  const applicantInfo = actualApplicantRows.map(r => getApplicantInfo(r as unknown as HTMLElement));
  return applicantInfo;
}

export type AppInfo = {
  id: string;
  name: string;
  files: {
    href: string;
    filename: string;
  }[];
};

function getApplicantInfo(row: HTMLElement) {
  const id = row.querySelector("[type='checkbox']")?.getAttribute('value') as string;
  const name = row.querySelector('td:nth-child(3)')?.textContent as string;
  return {id, name};
}

export async function getCandidateLinks(applications_id: string) {
  const individualApplicantInfo = await getData(
    makeLink(['applicants', 'view.php'], {v: applications_id, n: 'summary', f: 'tab'}),
    'get',
  );
  const links = parse(individualApplicantInfo)
    .querySelectorAll('tr a')
    .filter(a => a.getAttribute('href')?.includes('amazonaws'));
  return links.map(link => ({
    href: link.getAttribute('href') as string,
    filename: link.textContent,
  }));
}

export async function writeFile(path: string, filename: string, content: string) {
  return await fs.promises.writeFile(nodePath.join(path, filename), content);
}

export async function chooseDownloadLocation() {
  const paths = await ipcRenderer.invoke('dialog:location');
  if (paths.length == 0) return;
  return paths[0];
}

export async function downloadFile(
  basePath: string,
  searchId: string,
  applicantFolder: string,
  filename: string,
  url: string,
) {
  const folderPath = nodePath.join(basePath, searchId, applicantFolder);
  await fs.promises.mkdir(folderPath, {recursive: true});
  const filepath = nodePath.join(folderPath, filename);
  await ipcRenderer.invoke('file:download', url, filepath);
}

export async function saveApplicants(basePath: string, searchId: string, data: unknown) {
  const folderPath = nodePath.join(basePath, searchId);
  await fs.promises.mkdir(folderPath, {recursive: true});
  const filepath = nodePath.join(folderPath, 'applicants.csv');
  return await ipcRenderer.invoke('file:applicants', filepath, data);
}

export async function checkFile(
  basePath: string,
  searchId: string,
  applicantFolder: string,
  filename: string,
) {
  const filepath = nodePath.join(basePath, searchId, applicantFolder, filename);
  return await ipcRenderer.invoke('file:check', filepath);
}

// https://admin.hirecentric.com/manager/view.php?n=manager&f=showInactive
