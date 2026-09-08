function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-[#334155]/15 bg-[#FFFFFF] p-5 ${className}`}>
      {children}
    </section>
  );
}

export default Card;
