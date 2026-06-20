web: CUDA_VISIBLE_DEVICES=-1 gunicorn app:app --workers=1 --timeout=120 --bind=0.0.0.0:$PORT --log-level=info --access-logfile=- --error-logfile=-
