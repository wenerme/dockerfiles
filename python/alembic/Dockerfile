FROM wener/python

# Support PostgreSQL
RUN apk add --no-cache postgresql-dev python3-dev alpine-sdk && \
    pip3 install --no-cache-dir alembic && \
    pip3 install --no-cache-dir psycopg2
