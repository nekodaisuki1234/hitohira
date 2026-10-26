export const defaults = [
 {id:'teeth',name:'歯を磨く',minutes:5,step:'歯ブラシを手に取ってみよう。',icon:'✧',place:'home',start:19,end:4,habit:true,late:true},
 {id:'clothes',name:'明日の服を出す',minutes:3,step:'明日着たい服を、ひとつ選ぼう。',icon:'♧',place:'home',start:18,end:4,habit:true,late:true},
 {id:'desk',name:'机の上だけ片付ける',minutes:2,step:'目の前のものを、ひとつ元の場所へ。',icon:'▧',place:'home',start:8,end:23,habit:true,late:false},
 {id:'bath',name:'お風呂に入る',minutes:20,step:'まずはタオルを用意しよう。',icon:'≈',place:'home',start:18,end:4,habit:true,late:true},
 {id:'study',name:'少しだけ勉強する',minutes:10,step:'本やノートを開くところから。',icon:'▤',place:'any',start:8,end:22,habit:false,late:false},
 {id:'music',name:'好きな音楽を1曲',minutes:5,step:'今の気分に合う曲を選ぼう。',icon:'♫',place:'any',start:0,end:24,habit:false,late:false},
 {id:'breathe',name:'ひと息つく',minutes:1,step:'肩の力を抜いて、ゆっくり息を吐こう。',icon:'❋',place:'any',start:0,end:24,habit:false,late:true}
];
export function lifeDay(now, boundary=4){const d=new Date(now); d.setDate(d.getDate()-(d.getHours()<boundary?1:0));return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
export function inWindow(hour,start,end){return start===end|| (start<end?hour>=start&&hour<end:hour>=start||hour<end);}
export function periodKey(card,now,boundary=4){const d=new Date(now); // Anchor each window to the date it starts, even across midnight.
 if(card.start>card.end&&d.getHours()<card.end)d.setDate(d.getDate()-1);
 return `${card.id}:${card.start}-${card.end}:${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
export function candidates(state,now=Date.now()){
 const hour=new Date(now).getHours(),late=hour>=23||hour<4;
 return state.cards.filter(c=>c.enabled!==false&& (c.place==='any'||c.place===state.place)&&inWindow(hour,c.start,c.end)&&!(late&&!c.late)&&!(c.habit&&state.done.includes(periodKey(c,now,state.boundary)))&&c.id!==state.last);
}
export function choose(state,now=Date.now(),random=Math.random){
 let pool=candidates(state,now); const habits=pool.filter(c=>c.habit);
 if(habits.length && state.sinceHabit>=2)pool=habits;
 const weights=pool.map(c=>(c.habit?3:1)*(state.energy==='tired'?Math.max(1,12/c.minutes):1));
 let n=random()*weights.reduce((a,b)=>a+b,0);return pool.find((c,i)=>(n-=weights[i])<0)||pool.at(-1)||null;
}
export function fresh(){return {version:1,cards:structuredClone(defaults),place:'home',energy:'okay',boundary:4,done:[],history:[],active:null,last:null,sinceHabit:0};}
export function complete(state,now=Date.now()) {if(!state.active)return;const a=state.active;if(a.card.habit&&!state.done.includes(a.key))state.done.push(a.key);state.history.push({at:now,day:lifeDay(now,state.boundary),id:a.card.id});state.last=a.card.id;state.active=null;}
export function draw(state,now=Date.now(),random=Math.random){const c=choose(state,now,random);if(!c)return null;state.sinceHabit=c.habit?0:state.sinceHabit+1;state.active={card:structuredClone(c),key:periodKey(c,now,state.boundary),started:now,end:now+c.minutes*60000};return state.active;}
export function remaining(active,now=Date.now()){return Math.max(0,Math.ceil((active.end-now)/1000));}
