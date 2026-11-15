from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)  # "Income" or "Expense"
    category = Column(String, nullable=False)
    transaction_date = Column(String, nullable=False)  # YYYY-MM-DD
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship("User", back_populates="transactions")
