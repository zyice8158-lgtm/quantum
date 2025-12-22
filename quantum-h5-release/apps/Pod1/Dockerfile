FROM registry-sy.xcloud.lenovo.com/smb_solution_center/nginx:1.20.1-perl-err-pages-v6

COPY ["dist", "/usr/share/nginx/html/"]

RUN /etc/nginx/config_replace.sh