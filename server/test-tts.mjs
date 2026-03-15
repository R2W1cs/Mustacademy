import { Communicate } from 'edge-tts-universal';

const communicate = new Communicate('Hello, I am Dr. Aria from the CSM Roadmap podcast.', {
  voice: 'en-US-AriaNeural',
});

const buffers = [];
for await (const chunk of communicate.stream()) {
  if (chunk.type === 'audio' && chunk.data) {
    buffers.push(Buffer.from(chunk.data));
  }
}

const final = Buffer.concat(buffers);
console.log('SUCCESS - Bytes:', final.length);
