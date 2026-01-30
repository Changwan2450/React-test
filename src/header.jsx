import React from 'react';

// Header.jsx 내부 (props로 loginUser를 받고 있다고 가정)
const Header = (props) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <a className="navbar-brand fw-bold" href="#" onClick={() => props.onViewChange('food')}>
                    🚀 우리 동내 맛집 메뉴판
                </a>

                <div className="d-flex align-items-center">
                    {/* 일반적인 메뉴들 */}
                    <button className="btn btn-link nav-link me-3" onClick={() => props.onViewChange('food')}>메뉴판
                    </button>

                    {/* 로그인/로그아웃 버튼 */}
                    {props.loginUser ? (
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-white-50 small">{props.loginUser.id}님 환영;</span>
                            <button className="btn btn-sm btn-outline-light" onClick={props.onLogout}>로그아웃</button>
                        </div>
                    ) : (
                        <button className="btn btn-sm btn-warning fw-bold"
                                onClick={() => props.onViewChange('login')}>로그인</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;