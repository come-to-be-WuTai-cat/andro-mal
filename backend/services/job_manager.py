import uuid
import threading
import time

class JobManager:
    def __init__(self):
        self.jobs = {}
        self.lock = threading.Lock()

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        now = time.time()
        with self.lock:
            self.jobs[job_id] = {
                "status": "pending",
                "stage": "Initializing dynamic sandbox...",
                "stage_index": 1,
                "total_stages": 4,
                "progress": 5,
                "created_at": now,
                "started_at": now,
                "estimated_seconds": 25,
                "result": None
            }
        return job_id

    def update_progress(self, job_id: str, stage: str, stage_index: int = 1, progress: int = 25):
        with self.lock:
            if job_id in self.jobs:
                self.jobs[job_id]["stage"] = stage
                self.jobs[job_id]["stage_index"] = stage_index
                self.jobs[job_id]["progress"] = progress
                self.jobs[job_id]["elapsed_seconds"] = int(time.time() - self.jobs[job_id].get("started_at", time.time()))

    def update_job(self, job_id: str, status: str, result: dict = None, message: str = None):
        with self.lock:
            if job_id in self.jobs:
                self.jobs[job_id]["status"] = status
                if result is not None:
                    self.jobs[job_id]["result"] = result
                if message is not None:
                    self.jobs[job_id]["message"] = message
                if status == "running" and self.jobs[job_id].get("status") != "running":
                    self.jobs[job_id]["started_at"] = time.time()
                elif status == "complete":
                    self.jobs[job_id]["progress"] = 100
                    self.jobs[job_id]["stage_index"] = 4
                    self.jobs[job_id]["stage"] = "Dynamic analysis complete"
                self.jobs[job_id]["elapsed_seconds"] = int(time.time() - self.jobs[job_id].get("started_at", time.time()))

    def get_job(self, job_id: str) -> dict:
        with self.lock:
            job = self.jobs.get(job_id)
            if not job:
                return None
            job_copy = dict(job)
            if job_copy.get("status") in ["pending", "running"]:
                job_copy["elapsed_seconds"] = int(time.time() - job_copy.get("started_at", time.time()))
            return job_copy

job_manager = JobManager()

