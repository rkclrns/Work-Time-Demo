export type Role = "employee" | "admin";
export type WorkStatus = "working" | "done" | "off";
export type Employee = { id:string; name:string; email:string; department:string; position:string; role:Role; status:WorkStatus; avatar:string; employeeNo?:string };
export type Attendance = { id:string; employeeId:string; date:string; clockIn:string|null; clockOut:string|null; note?:string };
export type LeaveRequest = { id:string; employeeId:string; type:"연차"|"반차"|"병가"; startDate:string; endDate:string; days:number; reason:string; status:"pending"|"approved"|"rejected" };
export type DemoData = { employees:Employee[]; attendance:Attendance[]; leaves?:LeaveRequest[] };
const now = new Date();
const day = (n:number) => { const d=new Date(now); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
export const seedData:DemoData = {
  employees:[
    {id:"e1",name:"김민준",email:"minjun@worktime.kr",department:"프로덕트",position:"Product Designer",role:"employee",status:"working",avatar:"민"},
    {id:"e2",name:"이서연",email:"seoyeon@worktime.kr",department:"개발",position:"Frontend Engineer",role:"employee",status:"working",avatar:"서"},
    {id:"e3",name:"박지훈",email:"jihoon@worktime.kr",department:"개발",position:"Backend Engineer",role:"employee",status:"done",avatar:"지"},
    {id:"e4",name:"최유진",email:"yujin@worktime.kr",department:"마케팅",position:"Growth Marketer",role:"employee",status:"working",avatar:"유"},
    {id:"e5",name:"정하늘",email:"admin@worktime.kr",department:"경영지원",position:"People Manager",role:"admin",status:"working",avatar:"하"},
    {id:"e6",name:"한도윤",email:"doyoon@worktime.kr",department:"영업",position:"Account Executive",role:"employee",status:"off",avatar:"도"},
    {id:"e7",name:"오지아",email:"jia@worktime.kr",department:"프로덕트",position:"Product Manager",role:"employee",status:"done",avatar:"지"}
  ],
  attendance:Array.from({length:21}).flatMap((_,i)=>[
    {id:`a-e1-${i}`,employeeId:"e1",date:day(-i),clockIn:i===0?new Date(Date.now()-4.3*3600000).toISOString():`${day(-i)}T09:0${i%6}:00`,clockOut:i===0?null:`${day(-i)}T18:${10+i%5}:00`},
    {id:`a-e2-${i}`,employeeId:"e2",date:day(-i),clockIn:`${day(-i)}T08:${50+i%9}:00`,clockOut:i===0?null:`${day(-i)}T17:${40+i%15}:00`}
  ]).concat([
    {id:"a-e3-0",employeeId:"e3",date:day(0),clockIn:`${day(0)}T08:54:00`,clockOut:`${day(0)}T17:48:00`},
    {id:"a-e4-0",employeeId:"e4",date:day(0),clockIn:`${day(0)}T09:21:00`,clockOut:null},
    {id:"a-e5-0",employeeId:"e5",date:day(0),clockIn:`${day(0)}T08:47:00`,clockOut:null},
    {id:"a-e7-0",employeeId:"e7",date:day(0),clockIn:`${day(0)}T09:04:00`,clockOut:`${day(0)}T18:02:00`}
  ]),
  leaves:[
    {id:"l1",employeeId:"e1",type:"연차",startDate:day(12),endDate:day(13),days:2,reason:"개인 일정",status:"pending"},
    {id:"l2",employeeId:"e2",type:"반차",startDate:day(-3),endDate:day(-3),days:.5,reason:"병원 방문",status:"approved"},
    {id:"l3",employeeId:"e4",type:"연차",startDate:day(5),endDate:day(5),days:1,reason:"가족 행사",status:"approved"}
  ]
};
const KEY="worktime-demo-v1";
const SUPABASE_URL="https://gbllefugmgrmkrejgvay.supabase.co";
const SUPABASE_KEY="sb_publishable_mVsRAp4j7I6u-y6OI1Aw6Q_rhH9-nlm";
const endpoint=`${SUPABASE_URL}/rest/v1/wt_demo_state`;
const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};

async function remoteLoad():Promise<DemoData|null>{
  const response=await fetch(`${endpoint}?id=eq.shared-demo&select=payload`,{headers,cache:"no-store"});
  if(!response.ok) throw new Error(`Supabase load failed: ${response.status}`);
  const rows=await response.json() as {payload:DemoData}[];
  return rows[0]?.payload??null;
}

async function remoteSave(data:DemoData){
  const response=await fetch(endpoint,{
    method:"POST",
    headers:{...headers,Prefer:"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify({id:"shared-demo",payload:data,updated_at:new Date().toISOString()})
  });
  if(!response.ok) throw new Error(`Supabase save failed: ${response.status}`);
}

export const dataAccess={
  async load():Promise<DemoData> {
    if(typeof window==="undefined") return seedData;
    const cached=localStorage.getItem(KEY);
    const fallback=cached?JSON.parse(cached) as DemoData:seedData;
    try{
      const remote=await remoteLoad();
      if(remote){
        const normalized={...remote,leaves:remote.leaves??seedData.leaves};
        localStorage.setItem(KEY,JSON.stringify(normalized));
        return normalized;
      }
      await remoteSave(fallback);
      return fallback;
    }catch{
      return {...fallback,leaves:fallback.leaves??seedData.leaves};
    }
  },
  async save(data:DemoData){
    if(typeof window==="undefined") return;
    localStorage.setItem(KEY,JSON.stringify(data));
    await remoteSave(data);
  },
  reset(){ localStorage.removeItem(KEY); }
};

