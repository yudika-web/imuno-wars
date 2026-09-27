"""Original procedural arcade SFX. NumPy + Python stdlib, no downloaded samples.
Writes 22.05 kHz mono PCM16 WAV plus a file://-compatible embedded audio bank.
"""
from pathlib import Path
import numpy as np
import wave, json, base64
ROOT=Path(__file__).resolve().parents[1]
SR=22050
rng=np.random.default_rng(801)

def tone(duration,f0,f1=None,amp=.4,kind='sine',decay=5):
    t=np.arange(round(duration*SR))/SR
    f1=f0 if f1 is None else f1
    phase=2*np.pi*(f0*t+(f1-f0)*t*t/(2*duration))
    y=np.sin(phase)
    if kind=='soft': y=.8*y+.16*np.sin(phase*2)+.04*np.sin(phase*3)
    if kind=='triangle': y=2/np.pi*np.arcsin(y)
    env=np.minimum(t/.007,1)*np.exp(-decay*t/duration)*np.minimum((duration-t)/.012,1)
    return y*env*amp

def noise(duration,amp=.2):
    n=round(duration*SR);t=np.arange(n)/SR
    raw=rng.normal(0,1,n);raw=np.convolve(raw,np.ones(5)/5,mode='same')
    return raw*amp*np.minimum(t/.004,1)*np.exp(-10*t/duration)*np.minimum((duration-t)/.012,1)

def mix(*parts):
    n=max(round(offset*SR)+len(y) for offset,y in parts);out=np.zeros(n)
    for offset,y in parts:
        start=round(offset*SR);out[start:start+len(y)]+=y
    return out

def notes(freqs,step=.12,dur=.22,amp=.26):
    return mix(*[(i*step,tone(dur,f,amp=amp,kind='soft',decay=4))for i,f in enumerate(freqs)])

sounds={
'ui_click':tone(.08,650,1000,.27),
'place':mix((0,tone(.16,180,360,.33,kind='soft')),(.035,tone(.17,700,1100,.24))),
'oxygen':mix(*[(i*.085,tone(.15,f,f*1.6,.3,decay=7))for i,f in enumerate([520,690,900,1180])]),
'heal':notes([523.25,659.25,783.99],.08,.32,.22),
'scan':mix((0,tone(.34,420,1550,.23)),(.17,tone(.19,1250,1800,.16))),
'blaster':mix((0,tone(.15,1050,220,.34,kind='soft')),(0,noise(.09,.11))),
'heavy':mix((0,tone(.24,250,65,.47,kind='soft')),(.01,tone(.13,730,180,.23)),(0,noise(.20,.20))),
'pulse':mix((0,tone(.17,880,260,.3)),(.025,tone(.13,1400,540,.17))),
'arc':mix((0,tone(.20,1600,330,.25,kind='triangle')),(.02,noise(.13,.16))),
'antibody':mix((0,tone(.22,580,1300,.29)),(.05,tone(.15,880,1800,.18))),
'hit':mix((0,noise(.10,.32)),(0,tone(.10,160,75,.27))),
'shield':mix((0,tone(.20,480,320,.32)),(0,tone(.16,1230,960,.19))),
'enemy_down':mix((0,tone(.20,430,110,.32)),(.02,noise(.15,.16))),
'wave':notes([261.63,392,523.25],.16,.31,.28),
'boss':mix((0,notes([146.83,155.56,146.83],.22,.4,.34)),(0,tone(.86,73.42,68,.22,kind='soft',decay=1))),
'ability':notes([392,523.25,783.99,1046.5],.06,.27,.25),
'breach':mix((0,notes([196,155.56,130.81],.12,.26,.28)),(0,noise(.28,.21))),
'victory':notes([523.25,659.25,783.99,1046.5,783.99,1046.5],.17,.45,.3),
'defeat':notes([392,349.23,311.13,196],.23,.48,.29),
'pause':notes([660,440],.07,.13,.2),
'invalid':notes([185,174.61],.06,.12,.22),
}
limits={'ui_click':.065,'place':.075,'oxygen':.16,'heal':.22,'scan':.25,'blaster':.055,'heavy':.10,'pulse':.065,'arc':.07,'antibody':.08,'hit':.08,'shield':.10,'enemy_down':.10,'wave':.4,'boss':.7,'ability':.12,'breach':.20,'victory':1,'defeat':1,'pause':.1,'invalid':.2}
bank={};manifest=[]
for name,y in sounds.items():
    # Short fade to exact zero, no DC offset, and conservative headroom.
    y=y-np.mean(y);y[:32]*=np.linspace(0,1,32);y[-64:]*=np.linspace(1,0,64)
    peak=float(np.max(np.abs(y)))
    if peak>.65:y*=.65/peak
    pcm=np.round(np.clip(y,-1,1)*32767).astype('<i2')
    p=ROOT/'assets'/'audio'/f'{name}.wav'
    with wave.open(str(p),'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    info={'name':name,'file':f'assets/audio/{name}.wav','duration':round(len(y)/SR,3),'sampleRate':SR,'channels':1,'peak':round(float(np.max(np.abs(y))),4),'rms':round(float(np.sqrt(np.mean(y*y))),4),'cooldown':limits[name]}
    manifest.append(info);bank[name]={'wav':base64.b64encode(p.read_bytes()).decode(),'cooldown':limits[name],'volume':.85 if name in ['victory','defeat','wave','boss']else .65}
(ROOT/'assets/audio/manifest.json').write_text(json.dumps({'version':'0.8','origin':'Original procedural synthesis; no voice or external samples','sounds':manifest},indent=2)+'\n')
(ROOT/'data/audio-data.js').write_text('// Embedded WAV bank: no fetch required, including file:// mode.\nwindow.IMMUNO_AUDIO_DATA = '+json.dumps(bank,separators=(',',':'))+';\n')
print(f'Generated {len(sounds)} SFX, {sum(x["duration"] for x in manifest):.2f} seconds total.')
