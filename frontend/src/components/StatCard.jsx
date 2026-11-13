function StatCard({
  title,
  value,
  change,
  icon,
  positive = true,
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span
          className={
            positive
              ? "change positive"
              : "change negative"
          }
        >
          {change}
        </span>

      </div>

      <p className="stat-title">
        {title}
      </p>

      <h2 className="stat-value">
        {value}
      </h2>

    </div>
  );
}

export default StatCard;