export function audioBufferToWav(buffer:AudioBuffer,start=0,end=buffer.duration):Blob {
 const sampleRate=buffer.sampleRate, from=Math.max(0,Math.floor(start*sampleRate)), to=Math.min(buffer.length,Math.floor(end*sampleRate)), count=to-from;
 if(count<=0) throw new Error("End time must be after the start time.");
 const channels=buffer.numberOfChannels, bytesPerSample=2, dataBytes=count*channels*bytesPerSample;
 const out=new ArrayBuffer(44+dataBytes), view=new DataView(out);
 const write=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
 write(0,"RIFF"); view.setUint32(4,36+dataBytes,true); write(8,"WAVE"); write(12,"fmt "); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,channels,true); view.setUint32(24,sampleRate,true); view.setUint32(28,sampleRate*channels*bytesPerSample,true); view.setUint16(32,channels*bytesPerSample,true); view.setUint16(34,16,true); write(36,"data"); view.setUint32(40,dataBytes,true);
 let offset=44;
 for(let frame=from;frame<to;frame++){
  for(let channel=0;channel<channels;channel++){
   const sample=Math.max(-1,Math.min(1,buffer.getChannelData(channel)[frame]));
   view.setInt16(offset,sample<0?sample*0x8000:sample*0x7fff,true); offset+=2;
  }
 }
 return new Blob([out],{type:"audio/wav"});
}