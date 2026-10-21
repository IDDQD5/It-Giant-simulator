/**
 * IT Giant Simulator — Procedural Sound Engine (Web Audio API)
 */
(function(){'use strict';window.ITG=window.ITG||{};
let ctx=null,master=null,enabled=true,musicEnabled=true,vol=0.3,musicTimer=null,musicGain=null;
const K='itg_ss';
function init(){try{const s=localStorage.getItem(K);if(s){const o=JSON.parse(s);enabled=o.enabled!==false;musicEnabled=o.musicEnabled!==false;vol=o.vol!==undefined?o.vol:0.3;}}catch(e){}}
function save(){try{localStorage.setItem(K,JSON.stringify({enabled,musicEnabled,vol}));}catch(e){}}
function ensureContext(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination);musicGain=ctx.createGain();musicGain.gain.value=0.5;musicGain.connect(master);}catch(e){return;}}if(ctx&&ctx.state==='suspended')ctx.resume();}
function tone(freq,dur,type,volM){if(!enabled||!ctx)return;ensureContext();if(!ctx)return;const o=ctx.createOscillator();const g=ctx.createGain();o.type=type||'sine';o.frequency.value=freq;o.connect(g);g.connect(master||ctx.destination);const t=ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volM||0.15,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+(dur||0.15));o.start(t);o.stop(t+(dur||0.15)+0.05);}
function noise(dur,volM){if(!enabled||!ctx)return;ensureContext();if(!ctx)return;const b=ctx.createBuffer(1,ctx.sampleRate*(dur||0.1),ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;const g=ctx.createGain();s.connect(g);g.connect(master||ctx.destination);const t=ctx.currentTime;g.gain.setValueAtTime(volM||0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+(dur||0.1));s.start(t);s.stop(t+(dur||0.1)+0.05);}
function soft(freq,dur,type,volM){if(!enabled||!ctx)return;ensureContext();if(!ctx)return;const o=ctx.createOscillator();const g=ctx.createGain();o.type=type||'sine';o.frequency.value=freq;o.connect(g);g.connect(master||ctx.destination);const t=ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volM||0.1,t+0.008);g.gain.setTargetAtTime(volM*0.7,t+0.05,0.1);g.gain.exponentialRampToValueAtTime(0.001,t+(dur||0.2));o.start(t);o.stop(t+(dur||0.2)+0.05);}
function play(name){if(!enabled)return;ensureContext();if(!ctx)return;switch(name){
case 'click':soft(720,0.07,'triangle',0.07);break;
case 'hover':soft(520,0.05,'sine',0.04);break;
case 'open':soft(440,0.08,'sine',0.08);setTimeout(()=>soft(660,0.1,'sine',0.08),70);break;
case 'close':soft(660,0.08,'sine',0.08);setTimeout(()=>soft(440,0.1,'sine',0.08),70);break;
case 'tab':soft(600,0.06,'triangle',0.06);break;
case 'weekTick':soft(440,0.08,'sine',0.1);setTimeout(()=>soft(550,0.1,'sine',0.08),80);break;
case 'success':soft(523,0.1,'sine',0.12);setTimeout(()=>soft(659,0.1,'sine',0.12),100);setTimeout(()=>soft(784,0.15,'sine',0.12),200);break;
case 'error':soft(200,0.15,'sawtooth',0.1);setTimeout(()=>soft(150,0.2,'sawtooth',0.1),100);break;
case 'warning':soft(300,0.1,'square',0.08);setTimeout(()=>soft(250,0.1,'square',0.08),120);break;
case 'info':soft(600,0.08,'sine',0.08);break;
case 'productLaunch':soft(440,0.1,'sine',0.12);setTimeout(()=>soft(550,0.1,'sine',0.12),80);setTimeout(()=>soft(660,0.1,'sine',0.12),160);setTimeout(()=>soft(880,0.2,'sine',0.15),240);break;
case 'researchComplete':soft(660,0.1,'sine',0.1);setTimeout(()=>soft(880,0.15,'sine',0.1),100);break;
case 'hire':soft(500,0.08,'triangle',0.08);setTimeout(()=>soft(660,0.08,'triangle',0.06),60);break;
case 'fire':soft(400,0.1,'sawtooth',0.06);break;
case 'factoryUpgrade':noise(0.2,0.06);setTimeout(()=>soft(400,0.1,'square',0.08),50);break;
case 'purchase':soft(523,0.07,'sine',0.08);setTimeout(()=>soft(659,0.08,'sine',0.08),60);break;
case 'money':soft(880,0.06,'sine',0.05);setTimeout(()=>soft(1100,0.08,'sine',0.04),50);break;
case 'achievement':soft(523,0.1,'sine',0.12);setTimeout(()=>soft(659,0.1,'sine',0.12),80);setTimeout(()=>soft(784,0.1,'sine',0.12),160);setTimeout(()=>soft(1047,0.2,'sine',0.15),240);break;
case 'victory':[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>soft(f,0.2,'sine',0.15),i*150));break;
case 'defeat':[400,300,200,150].forEach((f,i)=>setTimeout(()=>soft(f,0.3,'sawtooth',0.1),i*200));break;
case 'save':soft(600,0.05,'sine',0.06);setTimeout(()=>soft(800,0.05,'sine',0.06),60);break;
default:soft(500,0.05,'sine',0.06);}}

// ── Background music: warm, gentle ambient loop ──
// A soft melodic pattern in a major key, slow and pleasant.
const melody=[
  {f:392.00,d:0.5},{f:440.00,d:0.5},{f:523.25,d:1.0},
  {f:440.00,d:0.5},{f:392.00,d:0.5},{f:349.23,d:1.0},
  {f:349.23,d:0.5},{f:392.00,d:0.5},{f:523.25,d:0.5},{f:440.00,d:0.5},
  {f:392.00,d:1.0},{f:329.63,d:1.0}
];
const bassLine=[130.81,130.81,174.61,174.61,196.00,196.00,130.81,130.81];
let musicStep=0,nextNoteTime=0;
function scheduleMusicNote(){
  if(!musicEnabled||!ctx||!enabled||!musicGain)return;
  const note=melody[musicStep%melody.length];
  const t=nextNoteTime;
  // melody note (warm triangle)
  const o=ctx.createOscillator();const g=ctx.createGain();
  o.type='triangle';o.frequency.value=note.f;o.connect(g);g.connect(musicGain);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.045,t+0.08);
  g.gain.exponentialRampToValueAtTime(0.001,t+note.d*0.95);
  o.start(t);o.stop(t+note.d+0.05);
  // soft bass undercurrent
  const bf=bassLine[musicStep%bassLine.length];
  const bo=ctx.createOscillator();const bg=ctx.createGain();
  bo.type='sine';bo.frequency.value=bf;bo.connect(bg);bg.connect(musicGain);
  bg.gain.setValueAtTime(0,t);bg.gain.linearRampToValueAtTime(0.03,t+0.1);
  bg.gain.exponentialRampToValueAtTime(0.001,t+note.d*1.1);
  bo.start(t);bo.stop(t+note.d+0.1);
  nextNoteTime+=note.d;
  musicStep++;
}
function musicLoop(){
  if(!musicEnabled||!ctx||!enabled)return;
  while(nextNoteTime<ctx.currentTime+0.2){scheduleMusicNote();}
}
function startMusic(){if(musicTimer)clearInterval(musicTimer);if(!musicEnabled)return;ensureContext();if(!ctx)return;nextNoteTime=ctx.currentTime+0.1;musicStep=0;musicLoop();musicTimer=setInterval(musicLoop,100);}
function stopMusic(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;}
function setEnabled(e){enabled=e;save();}
function setMusicEnabled(e){musicEnabled=e;if(!e)stopMusic();save();}
function setVolume(v){vol=Math.max(0,Math.min(1,v));if(master)master.gain.value=vol;save();}
function getSettings(){return{enabled,musicEnabled,vol};}
window.ITG.Sound={init,play,startMusic,stopMusic,setEnabled,setMusicEnabled,setVolume,getSettings,ensureContext};
})();
