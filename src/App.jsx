import {useEffect} from 'react';
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
import Diary from './views/Diary.jsx';
import Entry from './views/Entry.jsx';

const VIEWS={start:Start,home:Home,c1:C1,c2:C2,c3:C3,c4:C4,c5:C5,result:Result,record:Record,my:My,kid:Kid,map:MapView,community:Community,calendar:Calendar,diary:Diary,entry:Entry};

export default function App(){
 const {S,setUI}=useStore();
 const r=useRoute(S);
 const View=VIEWS[r]||(S.onboarded?Home:Start);
 useEffect(()=>{window.scrollTo(0,0);setUI(u=>{u.wheel=null});document.title='모닛'},[r,location.hash]); // eslint-disable-line
 return <View/>;
}
