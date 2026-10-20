/**
 * IT Giant Simulator — Procedural Sound Engine (Web Audio API)
 */
(function(){'use strict';window.ITG=window.ITG||{};
let ctx=null,master=null,enabled=true,musicEnabled=true,vol=0.3,musicTimer=null;
const K='itg_ss';
function init(){try{const s=localStorage.getItem(K);if(s){const o=JSON.parse(s);enabled=o.enabled!==false;musicEnabled=o.musicEnabled!==false;vol=o.vol!==undefined?o.vol:0.3;}}catch(e){}}
function save(){try{localStorage.setItem(K,JSON.stringify({enabled,musicEnabled,vol}));}catch(e){}}
function ensureContext(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination);}catch(e){return;}}if(ctx&&ctx.state==='suspended')ctx.resume();}
function tone(freq,dur,type,volM){if(!enabled||!ctx)return;ensureContext();if(!ctx)return;const o=ctx.createOscillator();const g=ctx.createGain();o.type=type||'sine';o.frequency.value=freq;o.connect(g);g.connect(master||ctx.destination);const t=ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volM||0.15,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+(dur||0.15));o.start(t);o.stop(t+(dur||0.15)+0.05);}
function noise(dur,volM){if(!enabled||!ctx)return;ensureContext();if(!ctx)return;const b=ctx.createBuffer(1,ctx.sampleRate*(dur||0.1),ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;const g=ctx.createGain();s.connect(g);g.connect(master||ctx.destination);const t=ctx.currentTime;g.gain.setValueAtTime(volM||0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+(dur||0.1));s.start(t);s.stop(t+(dur||0.1)+0.05);}
function play(name){if(!enabled)return;ensureContext();if(!ctx)return;switch(name){case 'click':tone(800,0.05,'square',0.06);break;case 'weekTick':tone(440,0.08,'sine',0.1);setTimeout(()=>tone(550,0.1,'sine',0.08),80);break;case 'success':tone(523,0.1,'sine',0.12);setTimeout(()=>tone(659,0.1,'sine',0.12),100);setTimeout(()=>tone(784,0.15,'sine',0.12),200);break;case 'error':tone(200,0.15,'sawtooth',0.1);setTimeout(()=>tone(150,0.2,'sawtooth',0.1),100);break;case 'warning':tone(300,0.1,'square',0.08);setTimeout(()=>tone(250,0.1,'square',0.08),120);break;case 'info':tone(600,0.08,'sine',0.08);break;case 'productLaunch':tone(440,0.1,'sine',0.12);setTimeout(()=>tone(550,0.1,'sine',0.12),80);setTimeout(()=>tone(660,0.1,'sine',0.12),160);setTimeout(()=>tone(880,0.2,'sine',0.15),240);break;case 'researchComplete':tone(660,0.1,'sine',0.1);setTimeout(()=>tone(880,0.15,'sine',0.1),100);break;case 'hire':tone(500,0.08,'triangle',0.08);break;case 'factoryUpgrade':noise(0.2,0.06);setTimeout(()=>tone(400,0.1,'square',0.08),50);break;case 'achievement':tone(523,0.1,'sine',0.12);setTimeout(()=>tone(659,0.1,'sine',0.12),80);setTimeout(()=>tone(784,0.1,'sine',0.12),160);setTimeout(()=>tone(1047,0.2,'sine',0.15),240);break;case 'victory':[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>tone(f,0.2,'sine',0.15),i*150));break;case 'defeat':[400,300,200,150].forEach((f,i)=>setTimeout(()=>tone(f,0.3,'sawtooth',0.1),i*200));break;case 'save':tone(600,0.05,'sine',0.06);setTimeout(()=>tone(800,0.05,'sine',0.06),60);break;default:tone(500,0.05,'sine',0.06);}}
const chordProg=[[261.63,329.63,392.00],[293.66,369.99,440.00],[349.23,440.00,523.25],[392.00,493.88,587.33]];
let chordIdx=0;
function playMusicChord(){if(!musicEnabled||!ctx||!enabled)return;const c=chordProg[chordIdx%chordProg.length];chordIdx++;c.forEach(f=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(master||ctx.destination);const t=ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.04,t+0.5);g.gain.exponentialRampToValueAtTime(0.001,t+3.5);o.start(t);o.stop(t+3.6);});}
function startMusic(){if(musicTimer)clearInterval(musicTimer);if(!musicEnabled)return;ensureContext();if(!ctx)return;playMusicChord();musicTimer=setInterval(playMusicChord,4000);}
function stopMusic(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;}
function setEnabled(e){enabled=e;save();}
function setMusicEnabled(e){musicEnabled=e;if(!e)stopMusic();save();}
function setVolume(v){vol=Math.max(0,Math.min(1,v));if(master)master.gain.value=vol;save();}
function getSettings(){return{enabled,musicEnabled,vol};}
window.ITG.Sound={init,play,startMusic,stopMusic,setEnabled,setMusicEnabled,setVolume,getSettings,ensureContext};
})();
