import { listVoices } from 'edge-tts-universal';

async function main() {
  try {
    const voices = await listVoices();
    const enVoices = voices.filter(v => v.ShortName.startsWith('en-US'));
    console.log(JSON.stringify(enVoices.map(v => ({ name: v.ShortName, gender: v.Gender })), null, 2));
  } catch (error) {
    console.error(error);
  }
}

main();
