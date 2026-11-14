const express=require('express'),http=require('http'),multer=require('multer'),fs=require('fs'),path=require('path'),crypto=require('crypto'),{Server}=require('socket.io');
const app=express(),srv=http.createServer(app),io=new Server(srv);
const DIR=process.env.DATA_DIR||path.join(__dirname,'data');fs.mkdirSync(path.join(DIR,'files'),{recursive:true});
const DBF=path.join(DIR,'db.json');let db=null,st;try{db=JSON.parse(fs.readFileSync(DBF))}catch{}
const save=()=>{clearTimeout(st);st=setTimeout(()=>fs.writeFile(DBF,JSON.stringify(db),()=>{}),300)};
const uid=()=>crypto.randomBytes(6).toString('hex'),hash=(p,s)=>crypto.scryptSync(p,s,32).toString('hex');
const BANDS={essential:{fee:199,reach:'Same city / within 100 km'},standard:{fee:499,reach:'Same state'},premier:{fee:999,reach:'All India'},elite:{fee:1999,reach:'All India'}},BL=Object.keys(BANDS);
const CITIES={Hyderabad:[17.385,78.487,'Telangana'],Warangal:[17.969,79.594,'Telangana'],Vijayawada:[16.506,80.648,'Andhra Pradesh'],Visakhapatnam:[17.686,83.218,'Andhra Pradesh'],Bengaluru:[12.972,77.595,'Karnataka'],Chennai:[13.083,80.271,'Tamil Nadu'],Mumbai:[19.076,72.878,'Maharashtra'],Pune:[18.52,73.857,'Maharashtra'],Delhi:[28.614,77.209,'Delhi'],Kolkata:[22.572,88.364,'West Bengal'],Ahmedabad:[23.023,72.572,'Gujarat'],Kochi:[9.931,76.267,'Kerala']};
const CHECK={criminal:['FIR copy','Bail/arrest papers','ID proof','Witness details'],civil:['Notices/legal letters','Agreements/contracts','Court orders','ID proof'],family:['Marriage certificate','ID proofs','Income proof','Prior court orders'],property:['Sale deed','Title documents','Encumbrance certificate','Tax receipts'],affidavit:['ID proof','Address proof','Draft details'],corporate:['Incorporation docs','Contracts','Correspondence']};
const DISC='AI-generated organisational summary. Not legal advice. Please review for accuracy.';
const bandFor=l=>{if(l.court==='Supreme Court'&&l.cat==='Senior Advocate')return'elite';if(l.cat==='Senior Advocate'||(['High Court','Supreme Court'].includes(l.court)&&l.exp>=12))return'premier';return l.exp>=5?'standard':'essential'};
const reassess=l=>{let b=bandFor(l);if(l.reviews>=25&&l.rating>=4.85)b=BL[Math.min(3,BL.indexOf(b)+1)];if(l.reviews>=25&&l.rating<3.5)b=BL[Math.max(0,BL.indexOf(b)-1)];const ch=b!==l.band;l.band=b;return ch};
const mk=(email,role,name,city,x={})=>{const s=uid(),u={id:uid(),role,name,email,salt:s,pw:hash('demo123',s),city,state:CITIES[city][2],lang:'English',...x};db.users[u.id]=u;return u};
const LAW=[['ravi@demo.in','Adv. Ravi Teja','Junior Advocate','District',['civil','affidavit'],['English','Telugu','Hindi'],2,'Hyderabad',60,41,10,50,4.3,22,'20 min',92,8000,1],
['sunita@demo.in','Adv. Sunita Rao','Junior Advocate','District',['family','affidavit'],['English','Telugu'],3,'Warangal',85,60,5,80,4.5,31,'30 min',88,10000,0],
['imran@demo.in','Adv. Imran Sheikh','Advocate','High Court',['criminal','civil'],['English','Hindi','Urdu','Telugu'],8,'Hyderabad',310,236,180,130,4.6,97,'15 min',90,40000,1],
['meera@demo.in','Adv. Meera Iyer','Advocate','High Court',['property','civil'],['English','Tamil','Kannada'],9,'Chennai',280,205,20,260,4.4,74,'40 min',85,45000,0],
['karthik@demo.in','Sr. Adv. Karthik Menon','Senior Advocate','High Court',['criminal'],['English','Malayalam','Hindi'],18,'Bengaluru',720,566,610,110,4.8,203,'1 hr',70,150000,1],
['anjali@demo.in','Sr. Adv. Anjali Deshmukh','Senior Advocate','High Court',['corporate','civil'],['English','Marathi','Hindi','Gujarati'],20,'Mumbai',650,498,40,610,4.7,181,'1 hr',72,180000,0],
['vikram@demo.in','Sr. Adv. Vikram Malhotra','Senior Advocate','Supreme Court',['criminal','civil'],['English','Hindi','Punjabi'],27,'Delhi',1500,1230,800,700,4.9,412,'2 hr',55,500000,1],
['farah@demo.in','Adv. Farah Khan','Advocate','High Court',['family','criminal'],['English','Hindi','Urdu'],7,'Delhi',240,170,90,150,4.3,58,'25 min',87,35000,0]
,['priya@demo.in','Adv. Priya Nair','Junior Advocate','District',['family','affidavit'],['English','Malayalam','Hindi'],3,'Kochi',70,48,4,66,4.4,26,'25 min',90,9000,1],
['suresh@demo.in','Adv. Suresh Babu','Junior Advocate','District',['property','civil'],['English','Telugu'],4,'Vijayawada',95,64,8,87,4.2,33,'35 min',86,9500,1],
['lakshmi@demo.in','Adv. Lakshmi Narayan','Junior Advocate','District',['criminal','affidavit'],['English','Telugu','Tamil'],2,'Visakhapatnam',48,30,26,22,4.1,15,'30 min',91,8500,0],
['rohit@demo.in','Adv. Rohit Verma','Junior Advocate','District',['civil','corporate'],['English','Hindi'],4,'Pune',88,57,6,82,4.3,29,'20 min',89,11000,1],
['deepa@demo.in','Adv. Deepa Krishnan','Advocate','District',['family','civil'],['English','Tamil'],6,'Chennai',190,131,15,175,4.5,64,'30 min',88,28000,1],
['arjun@demo.in','Adv. Arjun Reddy','Advocate','High Court',['criminal','property'],['English','Telugu','Hindi'],10,'Hyderabad',330,248,200,130,4.6,102,'20 min',92,42000,1],
['neha@demo.in','Adv. Neha Kulkarni','Advocate','District',['corporate','affidavit'],['English','Marathi','Hindi'],5,'Mumbai',150,104,10,140,4.4,47,'25 min',87,30000,0],
['sandeep@demo.in','Adv. Sandeep Ghosh','Advocate','High Court',['civil','family'],['English','Bengali','Hindi'],9,'Kolkata',260,181,25,235,4.5,81,'35 min',84,38000,1],
['hina@demo.in','Adv. Hina Patel','Advocate','District',['property','civil'],['English','Gujarati','Hindi'],7,'Ahmedabad',210,150,18,192,4.3,55,'30 min',86,32000,1],
['naveen@demo.in','Adv. Naveen Gowda','Advocate','High Court',['criminal','civil'],['English','Kannada','Hindi'],8,'Bengaluru',295,215,170,125,4.4,76,'25 min',88,36000,0],
['rajan@demo.in','Sr. Adv. Rajan Pillai','Senior Advocate','High Court',['property','civil'],['English','Malayalam','Tamil'],22,'Kochi',610,470,30,580,4.7,160,'1 hr',74,160000,1],
['sudha@demo.in','Adv. Sudha Venkatesh','Advocate','High Court',['family','civil'],['English','Tamil','Telugu'],14,'Chennai',520,395,35,485,4.6,142,'45 min',78,90000,0],
['amit@demo.in','Sr. Adv. Amit Bhatt','Senior Advocate','High Court',['corporate','civil'],['English','Gujarati','Hindi'],19,'Ahmedabad',590,450,45,545,4.8,175,'1 hr',72,140000,1],
['kavya@demo.in','Sr. Adv. Kavya Reddy','Senior Advocate','High Court',['criminal','family'],['English','Telugu','Hindi'],16,'Hyderabad',540,420,330,210,4.6,128,'50 min',76,120000,1],
['rajiv@demo.in','Sr. Adv. Rajiv Sinha','Senior Advocate','Supreme Court',['corporate','civil'],['English','Hindi','Bengali'],30,'Delhi',1700,1390,300,1400,4.9,455,'2 hr',52,600000,1],
['anita@demo.in','Sr. Adv. Anita Desai','Senior Advocate','Supreme Court',['family','criminal'],['English','Hindi','Marathi','Gujarati'],25,'Mumbai',1350,1090,520,830,4.8,380,'2 hr',58,450000,0]
];
const addLaw=(r,i)=>{const l={bar:'BC/'+(1000+i*37)+'/DEMO',verified:true,demo:true,cat:r[2],court:r[3],areas:r[4],langs:r[5],exp:r[6],radius:100,handled:r[8],won:r[9],crim:r[10],civil:r[11],rating:r[12],reviews:r[13],resp:r[14],acc:r[15],caseFee:r[16],online:!!r[17],bio:'',earnings:0};l.band=bandFor(l);mk(r[0],'lawyer',r[1],r[7],l)};
const hasEmail=e=>Object.values(db.users).some(u=>u.email===e);
function ensureDemo(){let n=0;
if(!hasEmail('client@demo.in')){mk('client@demo.in','client','Demo Client','Hyderabad');n++}
if(!hasEmail('client2@demo.in')){mk('client2@demo.in','client','Demo Client 2','Chennai');n++}
LAW.forEach((r,i)=>{if(!hasEmail(r[0])){addLaw(r,i);n++}});if(n)save()}
function seed(){db={users:{},cases:{},consults:{},notifs:[],sessions:{}}}
if(!db)seed();ensureDemo();
const notify=(to,text)=>{db.notifs.push({id:uid(),uid:to,text,t:Date.now(),read:false});if(db.notifs.length>2000)db.notifs.splice(0,500);io.to('u:'+to).emit('update',{text});save()};
const ping=to=>io.to('u:'+to).emit('update',{});
const km=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b[0]-a[0])/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(r(b[1]-a[1])/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const eligible=(l,c)=>{if(l.band!==c.band)return false;if(l.band==='essential')return km(CITIES[c.city],CITIES[l.city])<=Math.min(100,l.radius||100);if(l.band==='standard')return l.state===c.state;return true};
const pubU=u=>{const{pw,salt,earnings,...x}=u;return x},pubL=u=>{const{pw,salt,email,earnings,...x}=u;return{...x,successRate:x.handled?Math.round(x.won/x.handled*100):0}};
const readiness=c=>{const have=new Set(c.files.map(f=>f.docType)),need=c.brief.documents;return{score:Math.round(need.filter(d=>have.has(d)).length/need.length*100),missing:need.filter(d=>!have.has(d))}};
const consultsOf=c=>Object.values(db.consults).filter(k=>k.caseId===c.id);
const lview=(c,full)=>({id:c.id,client:full?db.users[c.uid].name:db.users[c.uid].name.split(' ')[0],city:c.city,court:c.court,area:c.area,lang:c.lang,band:c.band,brief:c.brief,status:c.status,files:c.files.filter(f=>full||f.shared),readiness:readiness(c),...(full?{hearings:c.hearings,updates:c.updates,agreement:c.agreement,description:c.description,pincode:c.pincode}:{})});
const auth=role=>(q,r,n)=>{const t=(q.headers.authorization||'').slice(7),u=db.users[db.sessions[t]];if(!u)return r.status(401).json({error:'Please log in'});if(role&&u.role!==role)return r.status(403).json({error:'Not allowed'});q.u=u;n()};
const bad=(r,m)=>r.status(400).json({error:m});
app.set('trust proxy',1);app.use((q,r,n)=>{r.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(self), microphone=(self)'});n()});
const fails={};const tooMany=ip=>(fails[ip]||[]).filter(t=>Date.now()-t<6e5).length>=15;
app.use(express.json({limit:'200kb'}));app.use(express.static(path.join(__dirname,'public')));
const up=multer({storage:multer.diskStorage({destination:path.join(DIR,'files'),filename:(q,f,cb)=>cb(null,uid())}),limits:{fileSize:10e6}});
const DEMO=LAW.map(r=>({email:r[0],label:BL.map(x=>x[0].toUpperCase()+x.slice(1))[BL.indexOf(bandFor({cat:r[2],court:r[3],exp:r[6]}))]+' · '+r[1].replace(/^(Sr\. )?Adv\. /,'')})).sort((a,b)=>BL.indexOf(a.label.split(' ')[0].toLowerCase())-BL.indexOf(b.label.split(' ')[0].toLowerCase()));
app.get('/api/health',(q,r)=>r.json({ok:true,lawyers:Object.values(db.users).filter(u=>u.role==='lawyer').length,uptime:Math.round(process.uptime())}));
app.get('/api/meta',(q,r)=>r.json({demo:DEMO,bands:BANDS,cities:Object.keys(CITIES),checks:CHECK,ice:[{urls:'stun:stun.l.google.com:19302'},...(process.env.TURN_URL?[{urls:process.env.TURN_URL,username:process.env.TURN_USER,credential:process.env.TURN_PASS}]:[])]}));
const session=(r,u)=>{const t=crypto.randomBytes(24).toString('hex');db.sessions[t]=u.id;save();r.json({token:t,user:pubU(u)})};
app.post('/api/register',(q,r)=>{const b=q.body||{},email=String(b.email||'').trim().toLowerCase();
if(!b.name||!/^\S+@\S+\.\S+$/.test(email)||String(b.password||'').length<6||!CITIES[b.city]||!['client','lawyer'].includes(b.role))return bad(r,'Fill all fields (password min 6 chars)');
if(Object.values(db.users).some(u=>u.email===email))return bad(r,'Email already registered');
const s=uid(),u={id:uid(),role:b.role,name:String(b.name).slice(0,60),email,salt:s,pw:hash(b.password,s),city:b.city,state:CITIES[b.city][2],lang:b.lang||'English'};
if(b.role==='lawyer'){if(!b.bar||!(b.exp>=0)||!b.areas?.length)return bad(r,'Bar Council ID, experience and practice areas are required');
Object.assign(u,{bar:String(b.bar).slice(0,30),verified:false,cat:b.cat||'Advocate',court:b.court||'District',areas:b.areas,langs:b.langs?.length?b.langs:['English'],exp:+b.exp,radius:100,handled:0,won:0,crim:0,civil:0,rating:0,reviews:0,resp:'—',acc:100,caseFee:+b.caseFee||10000,online:false,bio:'',earnings:0});u.band=bandFor(u)}
db.users[u.id]=u;session(r,u)});
app.post('/api/login',(q,r)=>{const u=Object.values(db.users).find(x=>x.email===String(q.body.email||'').trim().toLowerCase());if(tooMany(q.ip))return r.status(429).json({error:'Too many attempts. Try again in a few minutes.'});if(!u||hash(String(q.body.password||''),u.salt)!==u.pw){(fails[q.ip]=fails[q.ip]||[]).push(Date.now());return bad(r,'Wrong email or password')}if(q.body.role&&u.role!==q.body.role)return bad(r,'This is a '+u.role+' account. Use the '+u.role+' login.');session(r,u)});
app.get('/api/me',auth(),(q,r)=>r.json(pubU(q.u)));
app.put('/api/me',auth(),(q,r)=>{const u=q.u,b=q.body;if(b.name)u.name=String(b.name).slice(0,60);if(b.lang)u.lang=b.lang;if(CITIES[b.city]){u.city=b.city;u.state=CITIES[b.city][2]}
if(u.role==='lawyer'){if(Array.isArray(b.langs)&&b.langs.length)u.langs=b.langs;if(Array.isArray(b.areas)&&b.areas.length)u.areas=b.areas;if(b.radius>0)u.radius=Math.min(100,+b.radius);if(b.caseFee>0)u.caseFee=+b.caseFee;if(typeof b.online==='boolean')u.online=b.online;if(typeof b.bio==='string')u.bio=b.bio.slice(0,300)}
save();r.json(pubU(u))});
app.get('/api/lawyers',auth('client'),(q,r)=>{const c=db.cases[q.query.caseId];if(!c||c.uid!==q.u.id)return bad(r,'Select a case');const{area,lang,sort}=q.query;
let o=Object.values(db.users).filter(u=>u.role==='lawyer'&&eligible(u,c));if(area)o=o.filter(l=>l.areas.includes(area));if(lang)o=o.filter(l=>l.langs.includes(lang));
o.sort((a,b)=>sort==='exp'?b.exp-a.exp:sort==='resp'?b.acc-a.acc:b.rating-a.rating);r.json(o.map(pubL))});
app.post('/api/cases',auth('client'),(q,r)=>{const b=q.body,u=q.u;if(!BANDS[b.band]||!CHECK[b.area]||String(b.description||'').trim().length<10||!b.consent)return bad(r,'Describe your case (10+ chars), choose area/band and give location consent');
const city=CITIES[b.city]?b.city:u.city,c={id:uid(),uid:u.id,city,state:CITIES[city][2],pincode:String(b.pincode||'').slice(0,6),court:String(b.court||'').slice(0,80),lang:b.lang||u.lang,area:b.area,band:b.band,description:String(b.description).slice(0,3000),fee:BANDS[b.band].fee,paidAt:Date.now(),payRef:'DEMO-'+uid(),status:'registered',files:[],hearings:[],updates:[],agreement:null,lawyerId:null,review:null,created:Date.now()};
c.brief={headline:c.area[0].toUpperCase()+c.area.slice(1)+' matter in '+c.city+(c.court?' ('+c.court+')':''),summary:c.description.slice(0,400),language:c.lang,documents:CHECK[c.area],disclaimer:DISC};db.cases[c.id]=c;save();r.json(c)});
const stateFor=u=>{const notifs=db.notifs.filter(n=>n.uid===u.id).sort((a,b)=>b.t-a.t).slice(0,40);
if(u.role==='client'){const cases=Object.values(db.cases).filter(c=>c.uid===u.id).sort((a,b)=>b.created-a.created).map(c=>({...c,readiness:readiness(c),lawyer:c.lawyerId?pubL(db.users[c.lawyerId]):null,consults:consultsOf(c).map(k=>{const l=db.users[k.lawyerId];return{...k,lawyerName:l.name,band:l.band,cat:l.cat}})}));return{cases,notifs}}
const consults=Object.values(db.consults).filter(k=>k.lawyerId===u.id).sort((a,b)=>b.created-a.created).map(k=>{const c=db.cases[k.caseId],locked=c.lawyerId&&c.lawyerId!==u.id;return{...k,case:locked?null:lview(c,c.lawyerId===u.id),locked}});
const cases=Object.values(db.cases).filter(c=>c.lawyerId===u.id).map(c=>lview(c,true));const{pw,salt,...me}=u;return{consults,cases,notifs,me}};
app.get('/api/state',auth(),(q,r)=>r.json(stateFor(q.u)));
app.post('/api/notifs/read',auth(),(q,r)=>{db.notifs.forEach(n=>{if(n.uid===q.u.id)n.read=true});save();r.json({})});
app.post('/api/cases/:id/book',auth('client'),(q,r)=>{const c=db.cases[q.params.id],l=db.users[q.body.lawyerId];if(!c||c.uid!==q.u.id||!l||l.role!=='lawyer')return r.sendStatus(404);
if(c.lawyerId)return bad(r,'Lawyer already hired');const act=consultsOf(c).filter(k=>k.status!=='declined');if(act.length>=3)return bad(r,'All 3 consultations used');if(act.some(k=>k.lawyerId===l.id))return bad(r,'Already booked this lawyer');if(!eligible(l,c))return bad(r,'Lawyer outside your band/location');
const k={id:uid(),caseId:c.id,lawyerId:l.id,when:q.body.when||new Date().toISOString(),status:l.online?'scheduled':'requested',share:Math.round(c.fee/3),summary:null,decision:null,created:Date.now()};db.consults[k.id]=k;if(c.status==='registered')c.status='consulting';
notify(l.id,'New consultation '+(l.online?'booked':'request')+' for a '+c.area+' case');save();r.json(k)});
const myK=(q,r,who)=>{const k=db.consults[q.params.id];if(!k||k.lawyerId!==q.u.id){r.sendStatus(404);return null}return k};
app.post('/api/consults/:id/confirm',auth('lawyer'),(q,r)=>{const k=myK(q,r);if(!k)return;if(k.status!=='requested')return bad(r,'Not pending');k.status='scheduled';notify(db.cases[k.caseId].uid,q.u.name+' confirmed your consultation');save();r.json(k)});
app.post('/api/consults/:id/decline',auth('lawyer'),(q,r)=>{const k=myK(q,r);if(!k)return;if(!['requested','scheduled'].includes(k.status))return bad(r,'Cannot decline now');k.status='declined';notify(db.cases[k.caseId].uid,q.u.name+' could not take this slot. Your consultation slot is free to use again.');save();r.json(k)});
app.post('/api/consults/:id/complete',auth('lawyer'),(q,r)=>{const k=myK(q,r);if(!k)return;if(k.status!=='scheduled')return bad(r,'Call not scheduled');const c=db.cases[k.caseId],b=q.body;
k.status='completed';k.summary={language:c.lang,facts:c.brief.summary,advice:String(b.advice||'').slice(0,1500)||'No advice recorded.',next:String(b.next||'').slice(0,800),docs:String(b.docs||'').trim()?String(b.docs).slice(0,500):c.brief.documents.join(', '),at:Date.now(),disclaimer:DISC};
q.u.earnings+=k.share;notify(c.uid,'Consultation summary from '+q.u.name+' is ready');save();r.json(k)});
app.post('/api/consults/:id/decision',auth('lawyer'),(q,r)=>{const k=myK(q,r);if(!k)return;if(k.status!=='completed'||k.decision)return bad(r,'Not available');k.decision=q.body.accept?'accepted':'rejected';notify(db.cases[k.caseId].uid,q.u.name+(q.body.accept?' accepted':' declined')+' your case');save();r.json(k)});
app.post('/api/cases/:id/hire',auth('client'),(q,r)=>{const c=db.cases[q.params.id],k=c&&consultsOf(c).find(x=>x.lawyerId===q.body.lawyerId&&x.decision==='accepted');if(!c||c.uid!==q.u.id||!k||c.lawyerId)return bad(r,'Lawyer has not accepted this case');
if(!q.body.signature||!q.body.agree)return bad(r,'Sign and accept the agreement');const l=db.users[k.lawyerId],left=3-consultsOf(c).filter(x=>x.status!=='declined').length;
c.agreement={lawyer:l.name,caseFee:l.caseFee,advanceToken:Math.round(l.caseFee*.1),escrow:'Held in escrow, credited against case fee',scope:'Representation for the registered case as described in the case brief',schedule:'Advance token now; balance as agreed with the lawyer',signedBy:String(q.body.signature).slice(0,60),signedAt:Date.now(),creditLeft:Math.round(c.fee/3*left)};
c.lawyerId=l.id;c.status='hired';notify(l.id,'You were hired for a '+c.area+' case. Workspace is open.');consultsOf(c).forEach(x=>{if(x.lawyerId!==l.id)notify(x.lawyerId,'The client selected another lawyer. Case access removed.')});save();r.json(c)});
const canFile=(u,c,f)=>c.uid===u.id||(c.lawyerId?c.lawyerId===u.id:u.role==='lawyer'&&f.shared&&consultsOf(c).some(k=>k.lawyerId===u.id&&['scheduled','completed'].includes(k.status)));
app.post('/api/cases/:id/files',auth('client'),up.single('file'),(q,r)=>{const c=db.cases[q.params.id];if(!c||c.uid!==q.u.id||!q.file)return bad(r,'Invalid upload');
const f={id:q.file.filename,name:q.file.originalname.slice(0,100),size:q.file.size,docType:q.body.docType||'Other',shared:q.body.shared==='true',at:Date.now()};c.files.push(f);if(c.lawyerId)notify(c.lawyerId,'New document uploaded');save();r.json(f)});
app.get('/api/cases/:id/files/:fid',(q,r)=>{const u=db.users[db.sessions[q.query.t]],c=db.cases[q.params.id],f=c&&c.files.find(x=>x.id===q.params.fid);if(!u||!f||!canFile(u,c,f))return r.sendStatus(403);r.download(path.join(DIR,'files',f.id),f.name)});
app.put('/api/cases/:id/files/:fid',auth('client'),(q,r)=>{const c=db.cases[q.params.id],f=c&&c.uid===q.u.id&&c.files.find(x=>x.id===q.params.fid);if(!f)return r.sendStatus(404);f.shared=!!q.body.shared;save();r.json(f)});
const myCase=(q,r)=>{const c=db.cases[q.params.id];if(!c||c.lawyerId!==q.u.id){r.sendStatus(404);return null}return c};
app.post('/api/cases/:id/hearings',auth('lawyer'),(q,r)=>{const c=myCase(q,r);if(!c)return;if(!Date.parse(q.body.date))return bad(r,'Pick a date');c.hearings.push({id:uid(),date:q.body.date,court:String(q.body.court||c.court).slice(0,80),purpose:String(q.body.purpose||'Hearing').slice(0,120),reminded:false});c.hearings.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));notify(c.uid,'Hearing scheduled: '+new Date(q.body.date).toLocaleString());r.json(c.hearings)});
app.post('/api/cases/:id/updates',auth('lawyer'),(q,r)=>{const c=myCase(q,r);if(!c||!String(q.body.text||'').trim())return bad(r,'Write an update');c.updates.unshift({text:String(q.body.text).slice(0,500),at:Date.now()});notify(c.uid,'Case update from '+q.u.name);r.json(c.updates)});
app.post('/api/cases/:id/close',auth('lawyer'),(q,r)=>{const c=myCase(q,r);if(!c||c.status==='closed')return bad(r,'Cannot close');c.status='closed';c.outcome=['won','lost','settled'].includes(q.body.outcome)?q.body.outcome:'settled';notify(c.uid,'Your case is closed. Please leave a verified review.');r.json(c)});
app.post('/api/cases/:id/review',auth('client'),(q,r)=>{const c=db.cases[q.params.id];if(!c||c.uid!==q.u.id||c.status!=='closed'||c.review)return bad(r,'Review not available');const n=Math.max(1,Math.min(5,+q.body.rating||5)),l=db.users[c.lawyerId];
c.review={rating:n,text:String(q.body.text||'').slice(0,500),at:Date.now()};l.rating=Math.round((l.rating*l.reviews+n)/(l.reviews+1)*100)/100;l.reviews++;l.handled++;if(c.outcome==='won')l.won++;if(c.area==='criminal')l.crim++;else l.civil++;
const ch=reassess(l);notify(l.id,'New verified review: '+n+'/5'+(ch?'. Your band is now '+l.band:''));save();r.json(c)});
io.use((s,n)=>{const u=db.users[db.sessions[s.handshake.auth&&s.handshake.auth.token]];if(!u)return n(new Error('auth'));s.u=u;n()});
io.on('connection',s=>{s.join('u:'+s.u.id);
s.on('join',cid=>{const k=db.consults[cid],c=k&&db.cases[k.caseId];if(!k||k.status!=='scheduled'||!(k.lawyerId===s.u.id||c.uid===s.u.id))return s.emit('denied');s.room='r:'+cid;s.join(s.room);s.to(s.room).emit('peer-joined')});
['offer','answer','ice','chat'].forEach(e=>s.on(e,d=>s.room&&s.to(s.room).emit(e,e==='chat'?{n:s.u.name.split(' ')[0],t:String(d).slice(0,500)}:d)));
const lv=()=>{if(s.room){s.to(s.room).emit('peer-left');s.leave(s.room);s.room=null}};s.on('leave',lv);s.on('disconnect',lv)});
setInterval(()=>{const now=Date.now();Object.values(db.cases).forEach(c=>c.hearings.forEach(h=>{const d=Date.parse(h.date)-now;if(!h.reminded&&d>0&&d<864e5){h.reminded=true;notify(c.uid,'Reminder: hearing within 24 hours ('+h.purpose+')');if(c.lawyerId)notify(c.lawyerId,'Reminder: hearing within 24 hours ('+h.purpose+')')}}))},6e4);
srv.listen(process.env.PORT||3000,()=>console.log('LexBridge running on',process.env.PORT||3000));
