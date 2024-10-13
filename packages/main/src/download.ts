import {Readable} from 'stream';
import {finished} from 'stream/promises';
import {createWriteStream} from 'fs';
import {access} from 'fs/promises';

export async function checkAccess(filename: string) {
  try {
    await access(filename);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return false;
  }
}

export async function download(url: string | undefined, filename: string) {
  if (!url) {
    console.log('ERROR: unknown url for ' + filename);
    return;
  }
  const file = createWriteStream(filename);
  const {body} = await fetch(url);
  if (!body) throw new Error('Unable to download');
  await finished(Readable.from(body).pipe(file));
}
