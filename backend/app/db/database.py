"""
Database Layer for SkillGapAI using SQLite.
Stores Users, Profiles, Analysis History, Payments, and Chat Interactions.
Automatically seeds default Admin and Student accounts for instant demonstration.
"""

import sqlite3
import json
import uuid
import bcrypt
from pathlib import Path
from typing import Optional, Dict, Any, List

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "skillgap.db"


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def init_db():
    """Initializes tables and seeds default accounts."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            plan TEXT DEFAULT 'free',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Profiles Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY,
            target_role TEXT DEFAULT 'Software Developer',
            bio TEXT DEFAULT '',
            experience_level TEXT DEFAULT 'Entry-Level',
            skills_list TEXT DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # 3. Analyses History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            target_role TEXT NOT NULL,
            resume_source TEXT NOT NULL,
            overall_match REAL NOT NULL,
            matched_skills TEXT NOT NULL,
            partial_skills TEXT NOT NULL,
            missing_skills TEXT NOT NULL,
            skill_analysis TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
    """)

    # 4. Payments Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_name TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'USD',
            transaction_id TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'completed',
            card_last4 TEXT DEFAULT '4242',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # 5. Chatbot Messages Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    conn.commit()

    # Seed Default Accounts if not present
    cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@skillgap.ai",))
    if not cursor.fetchone():
        admin_pass = hash_password("Admin@123")
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role, plan)
            VALUES (?, ?, ?, ?, ?)
        """, ("admin@skillgap.ai", admin_pass, "System Administrator", "admin", "pro"))
        admin_id = cursor.lastrowid
        cursor.execute("""
            INSERT INTO profiles (user_id, target_role, bio, experience_level, skills_list)
            VALUES (?, ?, ?, ?, ?)
        """, (admin_id, "Platform Lead", "Research supervisor & systems administrator.", "Senior", "AI, Architecture, Full Stack"))

    cursor.execute("SELECT id FROM users WHERE email = ?", ("student@example.com",))
    if not cursor.fetchone():
        student_pass = hash_password("Student@123")
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role, plan)
            VALUES (?, ?, ?, ?, ?)
        """, ("student@example.com", student_pass, "Alex Rivera", "user", "free"))
        student_id = cursor.lastrowid
        cursor.execute("""
            INSERT INTO profiles (user_id, target_role, bio, experience_level, skills_list)
            VALUES (?, ?, ?, ?, ?)
        """, (student_id, "Software Developer", "Aspiring software engineer exploring web frameworks & cloud deployment.", "Junior", "JavaScript, React, Node.js, Git"))

    conn.commit()
    conn.close()


# Ensure database and seed accounts are initialized on module load
try:
    init_db()
except Exception as _e:
    print(f"[Warning] DB auto-init warning: {_e}")
