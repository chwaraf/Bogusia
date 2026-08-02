#!/usr/bin/env node
// =============================================================================
// analyze-structures.mjs — structural asserts + Monte-Carlo difficulty analyzer
// for the Bogusia STRUCTURES block (extracted live from bogusia-web/index.html).
//
//   node tests/analyze-structures.mjs [deals=200] [seed]
//
// Static asserts (must all PASS): even count, 44..80 tiles, no duplicate (x,y,z),
// everything physically supported, >=50% ground coverage, >=3 columns wide,
// fully drainable under the strictest rule set.
//
// Monte-Carlo: N random deals per structure per mode, played with the game's
// REAL rules — classic: covered-from-above (|dx|,|dy|<0.9) + side-block
// (same z, |dy|<0.85, dx in (-1.6,-0.35)|(0.35,1.6)); bar5: top-only. Face deal
// mirrors genGame: faces come in 4 identical copies over a 36-face pool.
// Policies: classic = random free pair, deadlock -> shuffle remaining faces
// (like in-game 🔀); bar5 = greedy "complete a bar pair else widest free face",
// bar-full -> barfull event + undo newest + shuffle (v4.48 behavior).
// Report: win rate, deadlocks / barfulls, avg bar pressure, solution length,
// type diversity, difficulty score, star rating, suggested scoring weight.
// =============================================================================
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'bogusia-web/index.html'), 'utf8');
const DEALS = parseInt(process.argv[2] || '200', 10);
let seed = parseInt(process.argv[3] || String(Date.now() % 100000), 10);

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffle(arr,rng){ for(let i=arr.length-1;i>0;i--){ const j=(rng()*(i+1))|0; [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

// --- extract the STRUCTURES block from the game source (source of truth) ---
const b0 = html.indexOf('// === STRUCTURES-BEGIN'), b1 = html.indexOf('// === STRUCTURES-END');
if(b0 < 0 || b1 < 0){ console.error('STRUCTURES markers not found'); process.exit(2); }
const gens = new Function(html.slice(b0, b1) + '; return STRUCTURE_GENS.map(g=>({fn:g,disp:g.disp||g.name, diff:g.diff||null, stars:g.stars||null}));')();

// --- rule mirrors (constants copied 1:1 from index.html) ---
const isOver = (a,b) => Math.abs(a.x-b.x)<0.9 && Math.abs(a.y-b.y)<0.9;
function isFree(t, alive, mode){
  for(const o of alive){ if(o!==t && o.z>t.z && isOver(o,t)) return false; }
  if(mode === 'bar5') return true;
  let l=false, r=false;
  for(const o of alive){ if(o===t || o.z!==t.z) continue; if(Math.abs(o.y-t.y)<0.85){ const dx=o.x-t.x; if(dx<-0.35 && dx>-1.6) l=true; if(dx>0.35 && dx<1.6) r=true; } }
  return !l || !r;
}
// deal mirror: genGame deals faces in 4-copy groups over a 36-face base pool
function dealTypes(n, rng, K=36){
  const need4=Math.floor(n/4), rem=n%4, need=need4+(rem>=2?1:0);
  const defs=[];
  while(defs.length<need){ const part=shuffle([...Array(K).keys()], rng); for(let i=0;i<part.length && defs.length<need;i++) defs.push(part[i]); }
  shuffle(defs, rng);
  const pool=[]; defs.forEach((d,idx)=>{ const c=(idx===need4 && rem>=2)?2:4; for(let i=0;i<c;i++) pool.push(d); });
  return { pool: shuffle(pool,rng), distinct: defs.length };
}

// --- policies ---
function simClassic(pos, types, rng){
  let alive = pos.map((p,i)=>({ ...p, type: types[i] }));
  let moves=0, deadlocks=0;
  while(alive.length){
    const free = alive.filter(t=>isFree(t,alive,'classic'));
    const by={}; free.forEach(t=>{ (by[t.type]=by[t.type]||[]).push(t); });
    const faces = Object.keys(by).filter(f=>by[f].length>=2);
    if(!faces.length){
      deadlocks++; if(deadlocks>300) return { win:false, moves, deadlocks };
      const rest = shuffle(alive.map(t=>t.type), rng); alive.forEach((t,i)=>t.type=rest[i]); // 🔀 like in-game shuffle
      continue;
    }
    const f = faces[(rng()*faces.length)|0], pair = by[f].slice(0,2);
    alive = alive.filter(t=>t!==pair[0] && t!==pair[1]);
    moves++;
  }
  return { win:true, moves, deadlocks };
}
function simBar5(pos, types, rng){
  let alive = pos.map((p,i)=>({ ...p, type: types[i] }));
  const bar=[]; let moves=0, barFulls=0, undos=0, maxBar=0, sumBar=0, steps=0, stuck=0;
  while(alive.length){
    let free = alive.filter(t=>isFree(t,alive,'bar5'));
    if(!free.length){ stuck++; if(stuck>200) return { win:false, moves, barFulls, avgBar:0 };
      const rest = shuffle(alive.map(t=>t.type), rng); alive.forEach((t,i)=>t.type=rest[i]); continue; }
    const completing = free.filter(t=>bar.includes(t.type));
    let pick;
    if(completing.length){ pick = completing[(rng()*completing.length)|0]; }
    else {
      const fc={}; free.forEach(t=>fc[t.type]=(fc[t.type]||0)+1);
      let best=-1, cands=[]; free.forEach(t=>{ const c=fc[t.type]; if(c>best){best=c;cands=[t];} else if(c===best) cands.push(t); });
      pick = cands[(rng()*cands.length)|0];
    }
    alive = alive.filter(t=>t!==pick); moves++;
    if(bar.includes(pick.type)){ bar.splice(bar.indexOf(pick.type),1); }
    else {
      bar.push(pick.type);
      if(bar.length>=5){ // bar full & no pair — v4.48: event, undo newest back to board, reshuffle
        barFulls++; undos++; const back = bar.pop(); alive.push({ ...pick, type: back });
        const rest = shuffle(alive.map(t=>t.type), rng); alive.forEach((t,i)=>t.type=rest[i]);
        if(barFulls>600) return { win:false, moves, barFulls, avgBar:0 };
      }
    }
    if(bar.length>maxBar) maxBar=bar.length; sumBar+=bar.length; steps++;
  }
  return { win:true, moves, barFulls, undos, maxBar, avgBar: sumBar/Math.max(1,steps) };
}

// --- static asserts (same rules as before) ---
function asserts(pts, name, warns=[]){
  const errs=[];
  if(pts.length%2) errs.push('odd count');
  if(pts.length<44 || pts.length>80) errs.push(`count ${pts.length} outside 44..80`);
  const seen=new Set(); pts.forEach(p=>{ const k=p.x+'/'+p.y+'/'+p.z; if(seen.has(k)) errs.push('dup '+k); seen.add(k); });
  const unsup=pts.filter(p=>p.z>0 && !pts.some(q=>q.z===p.z-1 && isOver(q,p)));
  if(unsup.length) errs.push(`${unsup.length} unsupported`);
  const z0=pts.filter(p=>p.z===0);
  const xs=z0.map(p=>p.x), ys=z0.map(p=>p.y);
  const W=Math.max(...xs)-Math.min(...xs)+1, H=Math.max(...ys)-Math.min(...ys)+1;
  if(z0.length/(W*H)<0.5) errs.push(`ground fill ${(z0.length/(W*H)*100)|0}% <50%`); // footprint of the ground layer (matches design docs)
  if(W<3) errs.push('width <3');
  // drainable = a removal order EXISTS. Fixed orders can strand vertical stacks even
  // under the top-only rule, so sample 200 random free-pair orders per rule set.
  const drainsOk=(mode)=>{ for(let att=0; att<200; att++){
      let alive=pts.map(p=>({...p})), guard=0;
      while(alive.length && guard++<600){
        const free=alive.filter(t=>isFree(t,alive,mode));
        if(free.length<2) break;
        const i=(Math.random()*free.length)|0; let j=(Math.random()*free.length)|0; if(j===i) j=(j+1)%free.length;
        alive=alive.filter(t=>t!==free[i] && t!==free[j]);
      }
      if(!alive.length) return true;
    } return false; };
  if(!drainsOk('bar5')) errs.push('cannot drain (hold-5 rule)');
  if(!drainsOk('classic')) warns.push('not always drainable under classic side-block (shuffle rescues)');
  return errs;
}

// --- run ---
console.log(`\n  seed=${seed}  deals=${DEALS}/structure/mode\n`);
const results=[];
let fail=0;
for(const g of gens){
  const pts = g.fn();
  const warns=[]; const errs = asserts(pts, g.disp, warns);
  if(errs.length){ console.log(`  ❌ ${g.disp}: ${errs.join('; ')}`); fail++; continue; }
  warns.forEach(w=>console.log(`  ⚠️  ${g.disp}: ${w}`));

  const rngC = mulberry32(seed), rngB = mulberry32(seed+7);
  const aggC={win:0,moves:[],dead:[]}, aggB={win:0,moves:[],fulls:[],avgBar:[],undos:[]};
  let distinctSum=0;
  for(let i=0;i<DEALS;i++){
    const { pool, distinct } = dealTypes(pts.length, mulberry32(seed*31+i));
    distinctSum+=distinct;
    const r1=simClassic(pts, shuffle([...pool],rngC), rngC);
    aggC.win+=r1.win?1:0; aggC.moves.push(r1.moves); aggC.dead.push(r1.deadlocks);
    const r2=simBar5(pts, shuffle([...pool],rngB), rngB);
    aggB.win+=r2.win?1:0; aggB.moves.push(r2.moves); aggB.fulls.push(r2.barFulls||0); aggB.avgBar.push(r2.avgBar||0); aggB.undos.push(r2.undos||0);
  }
  const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
  const n2=pts.length/2;
  const cDiff=avg(aggC.dead)/n2;                                   // deadlocks per pair
  const bDiff=avg(aggB.fulls)/n2 + 0.25*avg(aggB.avgBar)/5;        // bar-full per pair + steady pressure
  results.push({ name:g.disp, tiles:pts.length,
    classic:{win:aggC.win/DEALS, dead:avg(aggC.dead), moves:avg(aggC.moves), diff:cDiff},
    bar5:{win:aggB.win/DEALS, fulls:avg(aggB.fulls), barPct:avg(aggB.avgBar)/5, moves:avg(aggB.moves), diff:bDiff},
    distinctAvg: distinctSum/DEALS, typesPerPair: (distinctSum/DEALS)/n2,
    declaredDiff:g.diff, declaredStars:g.stars });
}
const pad=(s,n)=>String(s).padEnd(n).slice(0,n), rnd=(x,d=2)=>x.toFixed(d);
console.log('  STATIC ASSERTS: ' + (fail===0 ? `all PASS (${gens.length} structures)` : `${fail} FAILED`));
console.log('');
console.log(pad('  structure',30)+pad('tiles',7)+pad('winC',7)+pad('deadC',8)+pad('winB',7)+pad('fullB',8)+pad('bar%',7)+pad('movB',7)+pad('types',7)+'diffB');
console.log('  '+'─'.repeat(90));
for(const r of results){
  console.log(pad('  '+r.name,30)+pad(r.tiles,7)+pad((r.classic.win*100|0)+'%',7)+pad(rnd(r.classic.dead,1),8)+pad((r.bar5.win*100|0)+'%',7)+pad(rnd(r.bar5.fulls,1),8)+pad((r.bar5.barPct*100|0)+'%',7)+pad(rnd(r.bar5.moves,0),7)+pad(rnd(r.distinctAvg,1),7)+rnd(r.bar5.diff,3));
}
// star rating: quintile rank of bar5 difficulty inside the pool; scoring weight = relative to pool mean
const sorted=[...results].sort((a,b)=>a.bar5.diff-b.bar5.diff);
const mean=results.reduce((x,r)=>x+r.bar5.diff,0)/Math.max(1,results.length);
console.log('\n  suggested in-game values (bar5 difficulty):');
for(const r of results){
  const rank=sorted.indexOf(r);
  const stars=Math.max(1,Math.min(5, Math.ceil((rank+1)/sorted.length*5)));
  const weight=Math.max(0.8,Math.min(1.25, r.bar5.diff/mean));
  console.log(`    ${r.name}: stars ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}  weight ${rnd(weight,2)}${r.declaredDiff!=null?`   (in code: w=${r.declaredDiff}, ★${r.declaredStars})`:''}`);
}
console.log(`\n  note: faces are dealt in 4-copy groups over 36 types -> types/pair ~= ${rnd(results[0]?results[0].typesPerPair:0,2)} (deterministic); difficulty comes from blocking, not face variety.`);
console.log('');
process.exit(fail===0?0:1);
