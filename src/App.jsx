import {useLayoutEffect} from 'react';
import {useStore,useRoute} from './store.jsx';
import Start from './views/Start.jsx';
import Home from './views/Home.jsx';
import {C1,C2,C3,C4,C5} from './views/Course.jsx';
import Result from './views/Result.jsx';
import Record from './views/Record.jsx';
import My from './views/My.jsx';
import Kid from './views/Kid.jsx';
import MapView from './views/MapView.jsx';
import Community from './views/Community.jsx';
import Calendar from './views/Calendar.jsx';
import Category from './views/Category.jsx';
import Courses,{SavedCourses} from './views/Courses.jsx';
import Trip from './views/Trip.jsx';
import Diary from './views/Diary.jsx';
import Entry from './views/Entry.jsx';
import Place from './views/Place.jsx';
import Report from './views/Report.jsx';

const VIEWS={start:Start,home:Home,c1:C1,c2:C2,c3:C3,c4:C4,c5:C5,result:Result,record:Record,my:My,kid:Kid,map:MapView,community:Community,calendar:Calendar,cat:Category,courses:Courses,saved:SavedCourses,trip:Trip,diary:Diary,entry:Entry,place:Place,report:Report};

export default function App(){
 const {S,setUI}=useStore();
 const r=useRoute(S);
 const View=VIEWS[r]||(S.onboarded?Home:Start);
 /* 레이아웃 단계에서 스크롤을 올려야 화면 전환 스냅샷이 맨 위에서 찍힌다 */
 useLayoutEffect(()=>{window.scrollTo(0,0);setUI(u=>{u.wheel=null});document.title='모닛'},[r]); // eslint-disable-line
 return <View/>;
}
