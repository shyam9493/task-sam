import asyncio
from typing import Dict, Optional
import uuid
from datetime import datetime

class JobQueue:
    def __init__(self):
        self.jobs: Dict[str, Dict] = {}
        self.queue: asyncio.Queue = asyncio.Queue()
        
    def create_job(self, query: str, conversation_id: str) -> str:
        """Create a new job and return job ID"""
        job_id = str(uuid.uuid4())
        
        self.jobs[job_id] = {
            "job_id": job_id,
            "query": query,
            "conversation_id": conversation_id,
            "status": "pending",
            "created_at": datetime.now()
        }
        
        return job_id
    
    def get_job(self, job_id: str) -> Optional[Dict]:
        """Get job by ID"""
        return self.jobs.get(job_id)
    
    def update_job_status(self, job_id: str, status: str):
        """Update job status"""
        if job_id in self.jobs:
            self.jobs[job_id]["status"] = status
    
    def cleanup_old_jobs(self, max_age_seconds: int = 3600):
        """Remove jobs older than max_age_seconds"""
        now = datetime.now()
        to_remove = []
        
        for job_id, job in self.jobs.items():
            age = (now - job["created_at"]).total_seconds()
            if age > max_age_seconds:
                to_remove.append(job_id)
        
        for job_id in to_remove:
            del self.jobs[job_id]

# Global instance
job_queue = JobQueue()
