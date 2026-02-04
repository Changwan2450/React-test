import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import OrderList from "./OrderList";

const API_BASE = "http://100.124.152.75:8080/api";

function App() {
  // 1. 상태 관리 (모든 기능용)
  const [foods, setFoods] = useState([]);
  const [boards, setBoards] = useState([]);
  const [members, setMembers] = useState([]);
  const [view, setView] = useState("food");
  const [loginUser, setLoginUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "", pw: "" });
  const [foodForm, setFoodForm] = useState({ foodName: "", price: "" });
  const [isFoodEdit, setIsFoodEdit] = useState(false);
  const [editFoodId, setEditFoodId] = useState(null);
  const [boardMode, setBoardMode] = useState("list");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [boardForm, setBoardForm] = useState({ title: "", content: "" });
  const [isBoardEdit, setIsBoardEdit] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberEditForm, setMemberEditForm] = useState({ name: "" });
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태

  const isAdmin = loginUser?.id === "admin";

  // 2. 데이터 리프레시 로직
  const refreshList = async () => {
    try {
      const res = await axios.get(`${API_BASE}/food/list`);
      console.log("지금 들어온 메뉴들: ", res.data);
      setFoods(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  const refreshBoard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/board/list`);
      setBoards(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  const refreshMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/member/list`);
      setMembers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshList();
      await refreshBoard();
      if (isAdmin) await refreshMembers();
    };
    init();
  }, [isAdmin]);

  // 3. 검색 필터링 (게시판용)
  const filteredBoards = boards.filter(
    (b) =>
      b.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.writer.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 아까 찾은 500 에러의 주범들(name, age) 다 챙겨서 보낸다
      const response = await axios.post(`${API_BASE}/member/register`, {
        id: loginForm.id,
        pw: loginForm.pw,
        name: "개발자형", // 매퍼에 name 있으니까 필수!
        age: 25, // 매퍼에 age 있으니까 필수!
      });

      if (response.data === "success") {
        alert("가입 성공! 이제 로그인해.");
        setView("login");
      }
    } catch (error) {
      console.error(error);
      alert("가입 실패! 서버 콘솔 확인해봐.");
    }
  };

  // 4. 모든 핸들러 (삭제, 강퇴, 주문, 검색 등)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/member/login`, loginForm);
      if (res.data.status === "success") {
        setLoginUser(res.data.user);
        setView("food");
      } else alert("아이디/비번 확인해 형!");
    } catch {
      alert("서버 체크해봐;");
    }
  };

  const handleFoodSubmit = async () => {
    const data = {
      foodId: editFoodId,
      foodName: foodForm.foodName,
      price: parseInt(foodForm.price),
      category: "일반",
      memberId: loginUser?.id,
    };
    try {
      if (isFoodEdit) await axios.put(`${API_BASE}/food/update`, data);
      else await axios.post(`${API_BASE}/food/register`, data);
      setIsFoodEdit(false);
      setFoodForm({ foodName: "", price: "" });
      await refreshList();
    } catch {
      alert("음식 처리 실패!");
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm("이 메뉴 지울 거야?")) return;
    try {
      await axios.delete(`${API_BASE}/food/delete/${id}`);
      await refreshList();
    } catch {
      alert("삭제 실패!");
    }
  };

  const handleBoardSubmit = async () => {
    const data = {
      bno: selectedBoard?.bno,
      title: boardForm.title,
      content: boardForm.content,
      writer: loginUser.id,
    };
    try {
      if (isBoardEdit)
        await axios.put(
          `${API_BASE}/board/update?userId=${loginUser.id}`,
          data,
        );
      else await axios.post(`${API_BASE}/board/register`, data);
      setBoardMode("list");
      setIsBoardEdit(false);
      await refreshBoard();
    } catch {
      alert("게시판 실패!");
    }
  };

  const handleDeleteBoard = async (bno) => {
    if (!window.confirm("글 삭제할 거야?")) return;
    try {
      await axios.delete(
        `${API_BASE}/board/delete/${bno}?userId=${loginUser.id}`,
      );
      setBoardMode("list");
      await refreshBoard();
    } catch {
      alert("글 삭제 실패!");
    }
  };

  const handleMemberUpdate = async (id) => {
    try {
      await axios.put(`${API_BASE}/member/update`, {
        id,
        name: memberEditForm.name,
      });
      setEditingMemberId(null);
      await refreshMembers();
    } catch {
      alert("수정 실패!");
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("이 멤버 강퇴함?")) return;
    try {
      await axios.delete(`${API_BASE}/member/delete/${id}`);
      await refreshMembers();
    } catch {
      alert("강퇴 실패!");
    }
  };

  const handleOrder = async (food) => {
    if (!loginUser) {
      alert("로그인부터 해 형!");
      setView("login");
      return;
    }
    const amount = prompt(`${food.foodName} 몇개?`, "1");
    if (!amount) return;
    try {
      await axios.post(`${API_BASE}/order/register`, {
        fno: food.foodId,
        id: loginUser.id,
        amount: parseInt(amount),
      });
      alert("주문 완료! 주문내역 확인해봐.");
      setView("order");
    } catch {
      alert("주문 실패!");
    }
  };

  return (
    <div
      className="bg-light min-vh-100 d-flex flex-column"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <Header
        loginUser={loginUser}
        onLogout={() => {
          setLoginUser(null);
          setView("food");
        }}
        onViewChange={setView}
      />

      <main className="container flex-grow-1 py-5">
        {/* 탭 네비게이션 */}
        <div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          <button
            className={`btn ${view === "food" ? "btn-dark" : "btn-white shadow-sm"} rounded-pill px-4 fw-bold`}
            onClick={() => setView("food")}
          >
            🍴 메뉴판
          </button>
          <button
            className={`btn ${view === "order" ? "btn-dark" : "btn-white shadow-sm"} rounded-pill px-4 fw-bold`}
            onClick={() => setView("order")}
          >
            📋 주문내역
          </button>
          <button
            className={`btn ${view === "board" ? "btn-dark" : "btn-white shadow-sm"} rounded-pill px-4 fw-bold`}
            onClick={() => {
              setView("board");
              setBoardMode("list");
            }}
          >
            📝 게시판
          </button>
          {isAdmin && (
            <button
              className={`btn ${view === "memberList" ? "btn-dark" : "btn-white shadow-sm"} rounded-pill px-4 fw-bold`}
              onClick={() => setView("memberList")}
            >
              👥 멤버관리
            </button>
          )}
        </div>

        {/* --- 뷰 1: 메뉴판 (삭제 버튼 포함) --- */}
        {view === "food" && (
          <div className="row g-4">
            {isAdmin && (
              <div className="col-lg-4">
                <div
                  className="card border-0 shadow-sm p-4 rounded-4 sticky-top"
                  style={{ top: "20px" }}
                >
                  <h5 className="fw-bold mb-3">
                    {isFoodEdit ? "✏️ 메뉴 수정" : "🆕 신규 메뉴"}
                  </h5>
                  <input
                    className="form-control mb-2 rounded-3"
                    value={foodForm.foodName}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, foodName: e.target.value })
                    }
                    placeholder="음식명"
                  />
                  <input
                    className="form-control mb-4 rounded-3"
                    type="number"
                    value={foodForm.price}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, price: e.target.value })
                    }
                    placeholder="가격"
                  />
                  <button
                    className="btn btn-primary w-100 rounded-pill fw-bold"
                    onClick={handleFoodSubmit}
                  >
                    {isFoodEdit ? "수정완료" : "등록하기"}
                  </button>
                </div>
              </div>
            )}
            <div className={isAdmin ? "col-lg-8" : "col-12"}>
              <div className="row g-3">
                {foods.map((f) => (
                  <div className="col-md-6 col-xl-4" key={f.foodId}>
                    <div className="card border-0 shadow-sm p-4 h-100 rounded-4 position-relative">
                      {isAdmin && (
                        <div className="position-absolute top-0 end-0 p-2 d-flex gap-1">
                          <button
                            className="btn btn-sm btn-light shadow-sm rounded-circle"
                            onClick={() => {
                              setIsFoodEdit(true);
                              setEditFoodId(f.foodId);
                              setFoodForm({
                                foodName: f.foodName,
                                price: f.price,
                              });
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-danger shadow-sm rounded-circle"
                            onClick={() => handleDeleteFood(f.foodId)}
                          >
                            ❌
                          </button>
                        </div>
                      )}
                      <h5 className="fw-bold mb-1 pe-5">{f.foodName}</h5>
                      <p className="text-primary h4 fw-bold mb-4">
                        {Number(f.price).toLocaleString()}원
                      </p>
                      <button
                        className="btn btn-outline-dark w-100 rounded-pill fw-bold shadow-sm"
                        onClick={() => handleOrder(f)}
                      >
                        주문하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 뷰 2: 주문내역 --- */}
        {view === "order" && <OrderList loginUser={loginUser} />}

        {/* --- 뷰 3: 게시판 (검색 기능 포함) --- */}
        {view === "board" && (
          <div className="card border-0 shadow-sm p-4 rounded-4">
            {boardMode === "list" ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <h4 className="fw-bold m-0">📝 커뮤니티</h4>
                  <div className="d-flex gap-2 col-12 col-md-7">
                    <div className="input-group shadow-sm border rounded-pill overflow-hidden bg-white">
                      <span className="input-group-text bg-white border-0 ps-3 text-muted">
                        🔍
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 py-2 shadow-none"
                        placeholder="제목 또는 작성자 검색"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                    </div>
                    {loginUser && (
                      <button
                        className="btn btn-dark rounded-pill px-4 text-nowrap"
                        onClick={() => {
                          setBoardMode("write");
                          setBoardForm({ title: "", content: "" });
                          setIsBoardEdit(false);
                        }}
                      >
                        글쓰기
                      </button>
                    )}
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-4">No</th>
                        <th>제목</th>
                        <th>작성자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBoards.map((b) => (
                        <tr
                          key={b.bno}
                          onClick={() => {
                            setSelectedBoard(b);
                            setBoardMode("read");
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="py-3 px-4">{b.bno}</td>
                          <td className="fw-bold">{b.title}</td>
                          <td>
                            <span className="badge bg-light text-dark rounded-pill fw-normal">
                              {b.writer}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredBoards.length === 0 && (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-5 text-muted"
                          >
                            검색 결과가 없어 형;
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : boardMode === "read" ? (
              <div className="py-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="fw-bold m-0">{selectedBoard?.title}</h2>
                  {(loginUser?.id === selectedBoard?.writer || isAdmin) && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={() => {
                          setIsBoardEdit(true);
                          setBoardForm({
                            title: selectedBoard.title,
                            content: selectedBoard.content,
                          });
                          setBoardMode("write");
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={() => handleDeleteBoard(selectedBoard.bno)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
                <hr />
                <div
                  className="py-4"
                  style={{ whiteSpace: "pre-wrap", minHeight: "150px" }}
                >
                  {selectedBoard?.content}
                </div>
                <button
                  className="btn btn-dark rounded-pill px-4 fw-bold"
                  onClick={() => setBoardMode("list")}
                >
                  목록으로
                </button>
              </div>
            ) : (
              <div>
                <h4 className="fw-bold mb-4">
                  {isBoardEdit ? "✏️ 글 수정" : "📝 글 작성"}
                </h4>
                <input
                  className="form-control mb-3 rounded-3 py-3 border-0 bg-light shadow-sm"
                  value={boardForm.title}
                  onChange={(e) =>
                    setBoardForm({ ...boardForm, title: e.target.value })
                  }
                  placeholder="제목"
                />
                <textarea
                  className="form-control mb-4 rounded-3 border-0 bg-light shadow-sm"
                  rows="10"
                  value={boardForm.content}
                  onChange={(e) =>
                    setBoardForm({ ...boardForm, content: e.target.value })
                  }
                  placeholder="내용을 입력하세요"
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary rounded-pill px-5 fw-bold"
                    onClick={handleBoardSubmit}
                  >
                    저장하기
                  </button>
                  <button
                    className="btn btn-white rounded-pill px-4 border"
                    onClick={() => setBoardMode("list")}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 뷰 4: 멤버관리 (강퇴 포함) --- */}
        {view === "memberList" && isAdmin && (
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h4 className="fw-bold mb-4">👥 멤버 시스템</h4>
            <div className="table-responsive">
              <table className="table align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th>이름</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3 px-4 fw-bold">{m.id}</td>
                      <td>
                        {editingMemberId === m.id ? (
                          <input
                            className="form-control form-control-sm mx-auto w-50"
                            value={memberEditForm.name}
                            onChange={(e) =>
                              setMemberEditForm({ name: e.target.value })
                            }
                          />
                        ) : (
                          m.name || "형"
                        )}
                      </td>
                      <td>
                        {m.id !== "admin" && (
                          <div className="d-flex gap-2 justify-content-center">
                            {editingMemberId === m.id ? (
                              <button
                                className="btn btn-sm btn-success rounded-pill px-3"
                                onClick={() => handleMemberUpdate(m.id)}
                              >
                                저장
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                onClick={() => {
                                  setEditingMemberId(m.id);
                                  setMemberEditForm({ name: m.name });
                                }}
                              >
                                수정
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-danger rounded-pill px-3"
                              onClick={() => handleDeleteMember(m.id)}
                            >
                              강퇴
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 뷰 5: 로그인 --- */}
        {(view === "login" || view === "signup") && (
          <div className="d-flex justify-content-center py-5">
            <div
              className="card border-0 shadow-lg p-5 rounded-5"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              {view === "login" ? (
                <>
                  <h3 className="fw-bold text-center mb-4">LOGIN</h3>
                  <form onSubmit={handleLogin}>
                    <input
                      className="form-control mb-3 rounded-pill px-4 py-2 bg-light border-0"
                      placeholder="ID"
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, id: e.target.value })
                      }
                      required
                    />
                    <input
                      className="form-control mb-4 rounded-pill px-4 py-2 bg-light border-0"
                      type="password"
                      placeholder="PW"
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, pw: e.target.value })
                      }
                      required
                    />
                    <button className="btn btn-warning w-100 py-2 rounded-pill fw-bold text-white shadow-sm mb-3">
                      로그인
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-muted text-decoration-none small"
                        onClick={() => setView("signup")}
                      >
                        계정이 없으신가요? 회원가입
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h3 className="fw-bold text-center mb-4 text-success">
                    SIGN UP
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        // 서버 MyBatis 매퍼 규격(id, pw, name, age)에 딱 맞게 던진다!
                        await axios.post(`${API_BASE}/member/register`, {
                          id: loginForm.id,
                          pw: loginForm.pw,
                          name: "개발자형", // 매퍼에 name이 필수니까 일단 하드코딩!
                          age: 25, // 매퍼에 age가 필수니까 일단 하드코딩!
                        });
                        alert("가입 축하해 형! 이제 로그인해.");
                        setView("login");
                      } catch (error) {
                        // 500 에러 나면 서버가 보내는 진짜 이유를 팝업으로 띄움
                        const errMsg =
                          error.response?.data || "서버 로그 확인해봐 형";
                        alert("가입 실패! 사유: " + errMsg);
                      }
                    }}
                  >
                    <input
                      className="form-control mb-3 rounded-pill px-4 py-2 bg-light border-0"
                      placeholder="사용할 ID"
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, id: e.target.value })
                      }
                      required
                    />
                    <input
                      className="form-control mb-4 rounded-pill px-4 py-2 bg-light border-0"
                      type="password"
                      placeholder="사용할 PW"
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, pw: e.target.value })
                      }
                      required
                    />
                    <button className="btn btn-success w-100 py-2 rounded-pill fw-bold text-white shadow-sm mb-3">
                      가입완료
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-muted text-decoration-none small"
                        onClick={() => setView("login")}
                      >
                        이미 계정이 있어요! 로그인
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
