
import {
  Form, FormGroup, InputGroup, Input, Button
  , Modal, ModalHeader, ModalBody, ModalFooter, Table
} from 'reactstrap';
import {createContext, useState, useContext, useEffect, useRef } from 'react';
import { DietSchedulerContext } from './DietScheduler';
import DietListModal from './DietListModal';
import { Search } from 'react-bootstrap-icons';
import './ModalCommon.css';
import axios from 'axios';
import {useSelector} from 'react-redux'; // useSelector : 특정 변수의 값을 가져온다. 함수를 인자값으로 넣어야함. / useDispatch : reduce() 함수를 호출

/**
 * 식단 리스트 출력, 수정, 삭제 Modal컴포넌트
 * @returns 
 */
export const DietModalContext = createContext();

export default function DietModal({dietValue}) {

  const context = useContext(DietSchedulerContext);

  /* 버튼 제어 State변수 */
  // const [saveBtndisabled, setSaveBtndisabled] = useState(false);
  // const [btnMode, setBtnMode] = useState('');
  const [btnControlObject, setBtnControlObject] = useState({modify : false, save: true});
  const [dietListArray, setDietListArray] = useState([]);

  /* 모달2 State변수 */
  const [modalShow2, setModalShow2] = useState(false);
  const [modalShowResearchParam, setModalShowResearchParam] = useState(false);

  /* 검색창 검색어 State변수 */
  const [searchParam, setSearchParam] = useState('');

  /* 모달 2 파라미터 배열 변수(rno값) State변수 */
  const [selectRecipeData, setSelectRecipeData] = useState([]);

  const [mealDivStr, setMealDivStr] = useState('');

  const dietSearch = (mealDivValue) => {
    let param = {}
    let url = "/dietSearch";
    switch (mealDivValue) {
      case '아침': 
      param = {params:{dietDate : dietValue.dietDate, mealDiv: '1'}};
      break;
      case '점심': 
      param = {params:{dietDate : dietValue.dietDate, mealDiv: '2'}};
      break;
      case '저녁': 
      param = {params:{dietDate : dietValue.dietDate, mealDiv: '3'}};
      // break;
      // default : 
      // param = {params:{dietDate : dietValue.dietDate, mealDiv: '1'}};
    }
    axios.get(url, param)
    .then((res)=>{
      setDietListArray(res.data)
    })
    .catch((res)=>{
      alert(res)
    })
  }

  useEffect(()=>{
    setMealDivStr(dietValue.mealDivStr)
    dietSearch(dietValue.mealDivStr);
  },[])

  /* 모달 2가 닫힌 후 재조회... */
/*   useEffect(()=>{
    console.log(mealDivStr)
    setMealDivStr(mealDivStr)
    dietSearch(mealDivStr);
  },[modalShowResearchParam]) */

  const modalToggle2 = () => {
    setModalShow2(!modalShow2);
  }
  const modalStateValue = () => {
    setModalShowResearchParam(!modalShowResearchParam);
  }


  // renderDietArr tr태그 전역변수에 초기화.
  let renderDietArr = [];
  let renderSelectArr = [];
  let renderKcalArr = [];



  /* 식단 리스트 렌더 */
  const dietList = (dietListArray) =>{
    renderDietArr = []
    // if(dietListArray.length == 0) return;
    for(let i=0; i<dietListArray.length; i++) {

      renderDietArr.push(
        <tr key={dietListArray[i].dno} id={dietListArray[i].dno}>
          <td>
            <a style={{textDecoration: "none", color : "black"}} href="#" target='_blank' onClick={(e)=>{e.preventDefault();}}>{dietListArray[i].recipe.title}</a>
          </td>
          <td>
            {dietListArray[i].recipe.kcal}Kcal
          </td>
          <td>
            <a href="http://localhost/dietmenu" className="hyphenIcon" style={{ display: "show",textDecoration: "none", color : "black" }} onClick={delHypen}>(-)</a>
          </td>
        </tr>
      )
    }
    return renderDietArr;
  }

  /* 식단 목표 칼로리, 칼로리 총합 변수 선언 및 초기화*/
  let kcalTotal = 0;
  let targetKcal = 0;
  let achieve = '';

  /* 식단 목표 칼로리, 토탈 칼로리 */
  const dietKcal = (dietListArray) => {
    for(let i=0; i<dietListArray.length; i++) {
      kcalTotal += dietListArray[i].recipe.kcal;
      targetKcal = dietListArray[0].targetKcal;
      achieve = dietListArray[0].achieve;
      /* 식단 리스트 0일경우 목표칼로리 입력창 활성화 */
    }
    renderKcalArr.push(
      <tr key={0}>
        <td>
          <span style={{display:"block"}}>
            <label htmlFor="clngeTf">참여</label>
            <input type="checkbox" name="clngeTf" id="clngeTf" defaultChecked={achieve == 'y' ? true : false} onClick={(e)=>{console.log(e.target.checked)}}/>
          </span>
        </td>
        <td>
          <Input type="text" id="kcalInput" style={{width:"55px",height:"20px", display:"inline-block"}}
                value={targetKcal} disabled={(() => {return true;})()}/>Kcal
        </td>
        <td>
          {kcalTotal}Kcal
        </td>
        <td>
          <span style={{display:"block"}}>
            <label htmlFor="TargetTf">달성</label>
            <input type="checkbox" name="TargetTf" id="TargetTf"/>
          </span>
        </td>
    </tr>
    ) 
    return renderKcalArr;
  }

  // let mealDiv = '';
  const selectChange = (e)=>{
    e.preventDefault();
    setMealDivStr(e.target.value);
    dietSearch(e.target.value);
  } 
  
  /**
   * 검색창에 검색한 데이터 전역변수 초기화
  */
  const initSearchParam = (e) => {
    e.preventDefault();
    setSearchParam(e.target.value);
  }
  /**
   * Hypen 클릭시 해당 영역 <tr> 삭제(화면) , 배열에서 해당 요소 삭제(데이터)
   * @param {*} e 이벤트 객체 
   */
  const delHypen = (e) => {
    e.preventDefault();
    var that = e.target.parentNode.parentNode; // 이벤트가 발생한 태그의 조부모태그
    var key = that.id; // 이벤트가 발생한 태그의 조부모태그
    if(window.confirm("정말 삭제하시겠습니까?")) {
      axios.delete('/dietDelete', {data : {dNo : key} } )
      .then((response)=>{
        // var arrTr = renderDietArr.filter((item) => {
        //   return item.key != key; // 원본 배열과 일치하지 않는 데이터 배열로 반환
        // });
        // renderDietArr=arrTr; // let renderDietArr 배열에 삭제된 값으로 초기화(덮어씌움)
        // that.remove(); // 이벤트가 발생한 태그의 조부모 제거

        /* 삭제 후 재 조회 처리!! */
        dietSearch(mealDivStr); 
      })
      .catch((error)=>{
        return alert("삭제에 실패하였습니다.");
      })
      
    }
  }

  const modifyButtonClick = () => {
    setBtnControlObject({modify : true, save : false})
    // setBtnMode('modify');
    // buttonCrudMatrix();
  }
  const saveButtonClick = () => {
    setBtnControlObject({modify : false, save : true})
    // setBtnMode('save');
    // buttonCrudMatrix();
  }

  /* 버튼 제어 함수 */
  const buttonCrudMatrix = () => {
    // let curruentBtnMode = btnMode;
    // console.log(curruentBtnMode)

    // /* 수정 */
    // if(curruentBtnMode == '' || curruentBtnMode == 'save') { //초기페이지 [수정]
    //   setBtnControlObject({add : true, modify : true, del : true, cancel : true, save: false})
    // }
    // /* 저장 */
    // if(curruentBtnMode == 'modify') { //[수정]
    //   setBtnControlObject({add : false , modify : false, del : false, cancel : true, save: true})
    // }

  }

/**
 * context로 이중모달에 넘길 객체 (속성,메소드)
 */
  const modal2 = {
    modalShow2 : modalShow2
  , setModalShow2 : setModalShow2.bind(this)
  , modalShowResearchParam : modalShowResearchParam 
  , setModalShowResearchParam : setModalShowResearchParam.bind(this)
  , modalStateValue : modalStateValue.bind(this)
  , modalToggle2: modalToggle2.bind(this)
  , dietKcal : dietKcal.bind(this)
  }
  return (
    <>
      <Modal isOpen={context.modalShow1} fade={true} toggle={context.modalToggle1} style={{ width: "700px", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <ModalHeader toggle={context.modalToggle1}>
            <InputGroup size="sm" style={{width:"400px"}}>
              <div style={{height:"30px", float:"left"}}>
                <span style={{width:"170px",display:"inline-block"}}>
                  {dietValue.fmtDateKr} 
                </span>
              </div>
              <div style={{display:"inline-block", float:"right", height:"30px", paddingLeft: "0px"}}>
                <select name="" id="mealSelect" value={mealDivStr} onChange={selectChange}
                 style={{display:"inline", width:"85px", height:"30px", fontSize:"15px", padding:"4px 20px 0px 12px"}}>
                  <option value={"아침"} >아침</option>
                  <option value={"점심"} >점심</option>
                  <option value={"저녁"} >저녁</option>
                </select>
              </div>
              <div style={{height:"30px", float:"left"}}>
                <span style={{display:"inline-block"}}>식단</span>
              </div>
            </InputGroup>
        </ModalHeader>
        <ModalBody style={{ height: "600px" }}>
          <Form style={{height: "540px"}}>
            <FormGroup>
              <div style={{height:"38px"}}>
                <div id="inputGroup" style={{ margin: "0px", display:"show", float:"left"}}>
                  <InputGroup size="s">
                    <Input type="text" onKeyDown={(e)=>{ e.preventDefault(); if(e.key == "Enter") { if(e.target.value == "") {alert("검색어를 최소 1글자 이상 입력하셔야 합니다."); return } modalToggle2();}}} 
                    onChange={initSearchParam} placeholder='레시피를 입력하세요' style={{width:"427px", display: "inline-block"}} />
                    <Button onClick={(e)=>{e.preventDefault(); if(searchParam == "") {alert("검색어를 최소 1글자 이상 입력하셔야 합니다."); return } modalToggle2();}} color="secondary" style={{width:"40px"}}>
                      <Search style={{width:"20px", height:"20px",padding : "0 4 4 0"}}/>
                      </Button>
                  </InputGroup>
                </div>
              </div>
              <Table striped>
                <thead>
                  <tr>
                    <th>메뉴명</th>
                    <th>칼로리</th>
                    <th></th>
                  </tr>
                </thead>  
                <tbody id="listTbody">
                  {dietList(dietListArray)}
                  {/* {dietListArray.map((diet, i, dietListArray)=> {
                    console.log(dietListArray)
                    console.log(i)
                    console.log(diet.dno)
                    console.log(diet.recipe.title)
                    console.log(diet.recipe.kcal)
                    return(
                      <tr key={diet.dno} id={diet.dno}>
                        <td>
                          <a style={{textDecoration: "none", color : "black"}} href="#" target='_blank' onClick={(e)=>{e.preventDefault();}}>{diet.recipe.title}</a>
                        </td>
                        <td>
                          {diet.recipe.kcal}Kcal
                        </td>
                        <td>
                          <a href="http://localhost/dietmenu" className="hyphenIcon" style={{ display: "show",textDecoration: "none", color : "black" }} onClick={delHypen}>(-)</a>
                        </td>
                      </tr>
                    )
                  })} */}
                </tbody>
              </Table>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Table striped>
                <thead>
                  <tr>
                    <th>챌린지 참여</th>
                    <th>목표 칼로리</th>
                    <th>칼로리 합계</th>
                    <th>달성 여부</th>
                  </tr>
                </thead>  
                <tbody>
                    {dietKcal(dietListArray)}
                </tbody>
            </Table><br/><br/>
            <Button id="modifyButton" color="secondary" onClick={modifyButtonClick} disabled={btnControlObject.modify}>수정</Button>
            <Button id="saveButton" color="secondary" onClick={saveButtonClick} disabled={btnControlObject.save}>저장</Button>
        </ModalFooter>
      </Modal>
      { modalShow2 &&
          <DietModalContext.Provider value={modal2}>
            <DietListModal modalSearchProps={searchParam} dietDate={dietValue.dietDate} mealDivStr={mealDivStr}/>
          </DietModalContext.Provider>
        }
    </>

  )
}