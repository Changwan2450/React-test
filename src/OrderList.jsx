import React, {useState, useEffect} from 'react';
import axios from 'axios';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await axios.get("http://100.124.152.75:8080/api/order/list");
            setOrders(res.data);
        } catch (err) {
            console.error("주문 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 날짜 포맷팅 함수 (2026-01-30 14:30 형식)
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) return <div className="text-center py-5 text-muted">데이터 땡겨오는 중... zz;</div>;

    return (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden mt-4 bg-white">
            <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 text-dark fw-bold d-flex align-items-center justify-content-center">
                    <span className="badge bg-warning text-dark me-2">LIVE</span> 📦 실시간 주문 현황
                </h5>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-center">
                    <thead className="table-light text-secondary small text-uppercase">
                    <tr>
                        <th className="py-3">No</th>
                        <th className="py-3 text-start">메뉴이름</th>
                        <th className="py-3">주문자</th>
                        <th className="py-3">수량</th>
                        <th className="py-3">주문시간</th>
                    </tr>
                    </thead>
                    <tbody className="border-top-0">
                    {orders.length > 0 ? (
                        orders.map(o => (
                            <tr key={o.ono} className="border-bottom">
                                <td className="text-muted">{o.ono}</td>
                                <td className="text-start">
                                    <span className="fw-bold text-dark">{o.foodName}</span>
                                </td>
                                <td>
                                    <span className="badge bg-light text-dark border">{o.id}</span>
                                </td>
                                <td>
                                    <span className="fw-bold text-primary">{o.amount}</span>개
                                </td>
                                <td className="small text-muted">{formatDate(o.regdate)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="py-5 text-muted">
                                아직 주문이 없네 .. 장사 안 해? ;
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;