#!/bin/bash
ng serve reports --host=0.0.0.0 --port=8002 &
ng serve pq-admin --host=0.0.0.0 --port=8003 &
wait
