import {writeFile} from 'fs/promises';

export async function saveApplicants(filepath: string, data: {id: string; name: string}[]) {
  const string = data
    .map((entry: {id: string; name: string}) => `${entry.id},"${entry.name}"`)
    .join('\n');
  return await writeFile(filepath, string, 'utf-8');
}
