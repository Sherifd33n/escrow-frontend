import { useState, useEffect } from "react";
import { T } from "../../tokens";
import { Btn, Spin } from "../ui";
import { transactions } from "../../utils/api";

const F = ({ label, req, children }) => (
  <div>
    <div style={{ fontSize: 13, fontWeight: 600, color: T.gray700, marginBottom: 8 }}>
      {label}{req && <span style={{ color: T.red }}> *</span>}
    </div>
    {children}
  </div>
);

const ReviewModal = ({ tx, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [err, setErr] = useState("");

  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchReviews = () => {
    setLoadingReviews(true);
    transactions.getReviews(tx.realId || tx.id)
      .then(({ data, error }) => {
        setLoadingReviews(false);
        if (!error && data) {
          setReviewsList(data);
        }
      })
      .catch(() => setLoadingReviews(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [tx]);

  const handleSubmit = async () => {
    if (!rating) {
      setErr("Rating is required.");
      return;
    }
    setLoadingSubmit(true);
    setErr("");
    
    const { data, error } = await transactions.submitReview(tx.realId || tx.id, {
      rating,
      comment: comment.trim()
    });
    
    setLoadingSubmit(false);
    if (error) {
      setErr(error);
    } else {
      alert("Review submitted successfully!");
      if (onSubmit) onSubmit();
      fetchReviews();
      setComment("");
    }
  };

  // Check if current user has already submitted a review
  const currentUser = JSON.parse(sessionStorage.getItem("vp_user") || "{}");
  const hasReviewed = reviewsList.some(r => r.reviewer_id === currentUser.id);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,.15)", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#001637,#172b4d)", padding: "18px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Reviews & Ratings</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{tx.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", padding: 4 }}>
            <span className="msym" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Submit form if not reviewed yet */}
          {!hasReviewed ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, borderBottom: reviewsList.length > 0 ? "1px solid #e9e7eb" : "none", paddingBottom: reviewsList.length > 0 ? 20 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>Write a Review</div>
              
              <F label="Rating" req>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="msym"
                      style={{
                        fontSize: 32,
                        color: star <= rating ? "#d97706" : T.gray100,
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                      onClick={() => setRating(star)}
                    >
                      star
                    </span>
                  ))}
                </div>
              </F>

              <F label="Comment">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your experience with this transaction..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #c5c6cf", fontSize: 13.5, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                />
              </F>

              {err && (
                <div style={{ color: T.red, fontSize: 13, textAlign: "center" }}>
                  {err}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
                <Btn variant="accent" onClick={handleSubmit} disabled={loadingSubmit} style={{ flex: 1 }}>
                  {loadingSubmit ? <Spin size={16} /> : "Submit Review"}
                </Btn>
              </div>
            </div>
          ) : (
            <div style={{ background: T.greenLt, borderRadius: 10, padding: 14, fontSize: 13.5, color: "#006c47", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="msym" style={{ fontSize: 18 }}>check_circle</span> You have submitted a review for this transaction.
            </div>
          )}

          {/* Reviews list */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.primary, marginBottom: 12 }}>Transaction Reviews</div>
            {loadingReviews ? (
              <p style={{ fontSize: 13, color: T.gray500 }}>Loading reviews...</p>
            ) : reviewsList.length === 0 ? (
              <p style={{ fontSize: 13, color: T.gray500, fontStyle: "italic" }}>No reviews submitted yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviewsList.map((r) => (
                  <div key={r.id} style={{ background: T.offWhite, borderRadius: 10, padding: 12, border: "1px solid #e9e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: T.primary }}>{r.reviewer_name}</span>
                      <span style={{ display: "flex", gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="msym"
                            style={{
                              fontSize: 14,
                              color: star <= r.rating ? "#d97706" : T.gray100
                            }}
                          >
                            star
                          </span>
                        ))}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: T.gray700, lineHeight: 1.5, wordBreak: "break-word" }}>
                      {r.comment || <span style={{ fontStyle: "italic", color: T.gray400 }}>No comment left.</span>}
                    </div>
                    <div style={{ fontSize: 11, color: T.gray400, marginTop: 6, textAlign: "right" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReviewModal;
