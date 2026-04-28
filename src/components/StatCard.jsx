function StatCard({ title, value, extra }) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{extra}</p>
    </div>
  );
}

export default StatCard;