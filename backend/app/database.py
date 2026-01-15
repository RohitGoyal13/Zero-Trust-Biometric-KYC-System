from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# This creates a file 'kyc.db' in your project folder
DATABASE_URL = "sqlite:///./kyc.db"

# The connection engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the 'Table' (Like an Excel sheet for Users)
class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True)
    name = Column(String)
    id_number = Column(String)
    match_score = Column(Float)
    decision = Column(String) 
    timestamp = Column(DateTime, default=datetime.utcnow)

# Actually create the file now
Base.metadata.create_all(bind=engine)