FROM ubuntu:latest
LABEL authors="dataw"

ENTRYPOINT ["top", "-b"]

ADD sql /src-db
ADD scripts /src-db/scripts

RUN /src-db/scripts/prepare_sql_files.sh

ADD /src-db/scripts /docker-entrypoint-initdb.d