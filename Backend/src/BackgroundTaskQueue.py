import logging
import asyncio
from multiprocessing import Process
import uvloop
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__name__)


class _BackgroundTaskQueue:
    """
    This will spawn tasks on different threads in the background and limit the number of concurrent tasks
    """

    def __init__(self):
        self.currentActiveTasks = 0

    async def startTask(self, functionToStart, args):
        # First check if we have more then 1 tasks holding the mutex
        while self.currentActiveTasks > 1:
            logger.info("Too many tasks, waiting 10 seconds...")
            await asyncio.sleep(10)

        # Increment the current active tasks
        self.currentActiveTasks += 1

        # Start the function in a new process
        logger.info(f"Starting sub-process...")
        backgroundProcess = Process(
            target=self._run_async_function, args=(functionToStart, args), daemon=True
        )
        backgroundProcess.start()
        while backgroundProcess.is_alive():
            logger.info(f"Waiting for sub-process to finish...")
            await asyncio.sleep(10)
        logger.info(f"Sub-process finished 🚀")

        # Decrement the current active tasks
        self.currentActiveTasks -= 1

    @staticmethod
    def _run_async_function(functionToStart, args):
        # nest_asyncio.apply()
        uvloop.run(functionToStart(*args))


BackgroundTaskQueue = _BackgroundTaskQueue()
