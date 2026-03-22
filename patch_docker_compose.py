import re

with open('docker-compose.yml', 'r') as f:
    content = f.read()

services_block = """
  prometheus:
    image: prom/prometheus:v2.44.0
    container_name: medtutor-prometheus
    volumes:
      - ./infra/observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - medtutor-net

  loki:
    image: grafana/loki:2.8.2
    container_name: medtutor-loki
    volumes:
      - ./infra/observability/loki/local-config.yaml:/etc/loki/local-config.yaml
      - loki_data:/tmp/loki
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"
    networks:
      - medtutor-net

  promtail:
    image: grafana/promtail:2.8.2
    container_name: medtutor-promtail
    volumes:
      - /var/log:/var/log
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./infra/observability/promtail/promtail-config.yaml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - medtutor-net

  grafana:
    image: grafana/grafana:9.5.2
    container_name: medtutor-grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./infra/observability/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources
      - ./infra/observability/grafana/provisioning/dashboards:/etc/grafana/provisioning/dashboards
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
      - loki
    networks:
      - medtutor-net

  node-exporter:
    image: prom/node-exporter:v1.5.0
    container_name: medtutor-node-exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    expose:
      - 9100
    networks:
      - medtutor-net

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: medtutor-cadvisor
    privileged: true
    devices:
      - /dev/kmsg:/dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    expose:
      - 8080
    networks:
      - medtutor-net
"""

content = content.replace("networks:\n  medtutor-net:", services_block + "\nnetworks:\n  medtutor-net:")

with open('docker-compose.yml', 'w') as f:
    f.write(content)
