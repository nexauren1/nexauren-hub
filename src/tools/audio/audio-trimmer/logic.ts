import { audioBufferToWav } from "../shared/wav";
export function trimAudio(buffer:AudioBuffer,start:number,end:number) {
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>buffer.duration) throw new Error(`Choose a start and end between 0 and ${buffer.duration.toFixed(2)} seconds; end must be after start.`);
 return audioBufferToWav(buffer,start,end);
}