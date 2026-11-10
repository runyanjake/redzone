pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = 'redzone'
    DOCKER_BUILDKIT = '1'
    SERVICE = 'redzone'
    TRAEFIK_NETWORK = 'traefik'
    DISCORD_WEBHOOK = credentials('discord-pws-builds-channel-webhook')
  }

  options {
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Preflight') {
      steps {
        sh '''#!/bin/sh
          set -eu
          fail() { echo "PREFLIGHT FAILED: $*" >&2; exit 1; }

          [ -n "${DISCORD_WEBHOOK:-}" ] || fail "credential discord-pws-builds-channel-webhook is empty"

          command -v docker >/dev/null 2>&1 || fail "docker CLI not found"
          docker compose version >/dev/null 2>&1 || fail "docker compose plugin not found"
          docker info >/dev/null 2>&1 || fail "docker daemon not reachable"

          for f in Dockerfile .dockerignore docker-compose.yml package.json package-lock.json; do
            [ -f "$f" ] || fail "required file missing: $f"
          done

          docker compose config --quiet || fail "docker-compose.yml is invalid"
          docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1 || fail "external network '$TRAEFIK_NETWORK' does not exist"
        '''
      }
    }

    stage('Lint & Test') {
      steps {
        sh '''#!/bin/sh
          set -eu
          docker build --pull --progress=plain --target test -f Dockerfile . \
            || { echo "LINT & TEST FAILED: see build output above" >&2; exit 1; }
        '''
      }
    }

    stage('Teardown') {
      steps {
        sh '''#!/bin/sh
          set -eu
          docker compose down --remove-orphans \
            || { echo "TEARDOWN FAILED: could not stop previous deployment" >&2; exit 1; }
          # Clears a same-named container left behind by a run under a different project name.
          docker rm -f "$SERVICE" >/dev/null 2>&1 || true
        '''
      }
    }

    stage('Build & Deploy') {
      steps {
        sh '''#!/bin/sh
          set -eu
          docker compose build --pull \
            || { echo "BUILD FAILED: release image did not build" >&2; exit 1; }
          docker compose up -d \
            || { echo "DEPLOY FAILED: containers did not start" >&2; exit 1; }
        '''
      }
    }

    stage('Health Check') {
      steps {
        sh '''#!/bin/sh
          set -eu
          for i in $(seq 1 30); do
            state=$(docker inspect -f '{{.State.Status}}' "$SERVICE" 2>/dev/null || echo missing)
            health=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$SERVICE" 2>/dev/null || true)
            case "$state:$health" in
              running:healthy) echo "$SERVICE is healthy"; exit 0 ;;
              running:unhealthy) echo "HEALTH CHECK FAILED: $SERVICE reported unhealthy" >&2; exit 1 ;;
              exited:*|dead:*|missing:*) echo "HEALTH CHECK FAILED: $SERVICE is $state" >&2; exit 1 ;;
            esac
            sleep 2
          done
          echo "HEALTH CHECK FAILED: $SERVICE not healthy after 60s (state=$state health=$health)" >&2
          exit 1
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''#!/bin/sh
          set -eu
          body=$(docker run --rm --network "$TRAEFIK_NETWORK" curlimages/curl:8.10.1 -fsS --max-time 10 "http://$SERVICE/") \
            || { echo "SMOKE TEST FAILED: request to http://$SERVICE/ failed" >&2; exit 1; }
          echo "$body" | grep -q '<div id="root">' \
            || { echo "SMOKE TEST FAILED: response is missing the app root element" >&2; exit 1; }
          echo "$body" | grep -q '<title>Web Video Redzone</title>' \
            || { echo "SMOKE TEST FAILED: response has an unexpected page title" >&2; exit 1; }
          echo "Smoke test passed"
        '''
      }
    }
  }

  post {
    always {
      script {
        def result = currentBuild.currentResult
        def emoji = result == 'SUCCESS' ? ':green_circle:' : (result == 'FAILURE' ? ':red_circle:' : ':yellow_circle:')
        def branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'Main/Manual'
        def duration = currentBuild.durationString.replace(' and no weeks', '').replace(' and counting', '')
        def commits = currentBuild.changeSets.collectMany { cs ->
          cs.items.collect { "> ${it.msg} (by *${it.author.fullName}*)" }
        }
        def commitText = commits ? commits.join('\n') : 'No recent changes detected.'
        def discordDescription = """**Status:** ${emoji} ${result}
**Branch:** `${branch}`
**Duration:** :stopwatch: ${duration}

**Commits:**
${commitText}"""

        discordSend(
          webhookURL: env.DISCORD_WEBHOOK,
          title: "📦 Build Alert: ${env.JOB_NAME} [Build #${env.BUILD_NUMBER}]",
          link: "${env.BUILD_URL}",
          result: "${currentBuild.currentResult}",
          description: discordDescription
        )
      }
    }
    failure {
      sh '''#!/bin/sh
        echo "=== docker compose ps ==="
        docker compose ps -a || true
        echo "=== docker compose logs (last 200 lines) ==="
        docker compose logs --no-color --tail=200 || true
        echo "=== $SERVICE health log ==="
        docker inspect -f '{{json .State.Health}}' "$SERVICE" 2>/dev/null || true
      '''
    }
  }
}
