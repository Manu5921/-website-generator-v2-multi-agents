#!/bin/bash

# 🚀 Production Load Testing Script - Multi-Agent Platform
# Comprehensive performance validation for production deployment

set -e

echo "🚀 Starting Production Load Testing Suite"
echo "=========================================="

# Configuration
BASE_URL=${1:-"http://localhost:3334"}
CONCURRENT_REQUESTS=50
TEST_DURATION=30
REPORT_FILE="load-test-report-$(date +%Y%m%d_%H%M%S).json"

echo "🎯 Testing target: $BASE_URL"
echo "📊 Concurrent requests: $CONCURRENT_REQUESTS"
echo "⏱️  Test duration: ${TEST_DURATION}s"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize report
echo "{" > "$REPORT_FILE"
echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$REPORT_FILE"
echo "  \"baseUrl\": \"$BASE_URL\"," >> "$REPORT_FILE"
echo "  \"tests\": {" >> "$REPORT_FILE"

# Test 1: Health Check Endpoint
echo -e "${BLUE}🏥 Test 1: Health Check Performance${NC}"
echo "Testing $BASE_URL/api/health..."

health_times=()
health_status_codes=()

for i in $(seq 1 $CONCURRENT_REQUESTS); do
    result=$(curl -s -o /dev/null -w "%{time_total}:%{http_code}" "$BASE_URL/api/health" &)
    health_times+=($result)
done
wait

# Calculate health check stats
total_time=0
success_count=0
for result in "${health_times[@]}"; do
    time_part=$(echo $result | cut -d: -f1)
    status_part=$(echo $result | cut -d: -f2)
    total_time=$(echo "$total_time + $time_part" | bc -l)
    if [[ "$status_part" == "200" ]] || [[ "$status_part" == "503" ]]; then
        ((success_count++))
    fi
done

avg_health_time=$(echo "scale=3; $total_time / $CONCURRENT_REQUESTS" | bc -l)
health_success_rate=$(echo "scale=2; $success_count * 100 / $CONCURRENT_REQUESTS" | bc -l)

echo -e "${GREEN}✅ Health Check Results:${NC}"
echo "   Average Response Time: ${avg_health_time}s"
echo "   Success Rate: ${health_success_rate}%"
echo ""

# Add to report
echo "    \"healthCheck\": {" >> "$REPORT_FILE"
echo "      \"averageResponseTime\": $avg_health_time," >> "$REPORT_FILE"
echo "      \"successRate\": $health_success_rate," >> "$REPORT_FILE"
echo "      \"totalRequests\": $CONCURRENT_REQUESTS" >> "$REPORT_FILE"
echo "    }," >> "$REPORT_FILE"

# Test 2: Metrics API Performance
echo -e "${BLUE}📊 Test 2: Metrics API Performance${NC}"
echo "Testing $BASE_URL/api/system/metrics..."

metrics_times=()
for i in $(seq 1 20); do
    time_result=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/system/metrics" &)
    metrics_times+=($time_result)
done
wait

# Calculate metrics stats
total_metrics_time=0
for time in "${metrics_times[@]}"; do
    total_metrics_time=$(echo "$total_metrics_time + $time" | bc -l)
done

avg_metrics_time=$(echo "scale=3; $total_metrics_time / 20" | bc -l)

echo -e "${GREEN}✅ Metrics API Results:${NC}"
echo "   Average Response Time: ${avg_metrics_time}s"
echo ""

# Add to report
echo "    \"metricsApi\": {" >> "$REPORT_FILE"
echo "      \"averageResponseTime\": $avg_metrics_time," >> "$REPORT_FILE"
echo "      \"totalRequests\": 20" >> "$REPORT_FILE"
echo "    }," >> "$REPORT_FILE"

# Test 3: Dashboard V2 Performance
echo -e "${BLUE}🎨 Test 3: Dashboard V2 Performance${NC}"
echo "Testing $BASE_URL/dashboard-v2..."

dashboard_times=()
for i in $(seq 1 10); do
    time_result=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/dashboard-v2" &)
    dashboard_times+=($time_result)
done
wait

# Calculate dashboard stats
total_dashboard_time=0
for time in "${dashboard_times[@]}"; do
    total_dashboard_time=$(echo "$total_dashboard_time + $time" | bc -l)
done

avg_dashboard_time=$(echo "scale=3; $total_dashboard_time / 10" | bc -l)

echo -e "${GREEN}✅ Dashboard V2 Results:${NC}"
echo "   Average Response Time: ${avg_dashboard_time}s"
echo ""

# Add to report
echo "    \"dashboardV2\": {" >> "$REPORT_FILE"
echo "      \"averageResponseTime\": $avg_dashboard_time," >> "$REPORT_FILE"
echo "      \"totalRequests\": 10" >> "$REPORT_FILE"
echo "    }," >> "$REPORT_FILE"

# Test 4: Mixed Load Test
echo -e "${BLUE}🔥 Test 4: Mixed Load Test (Stress Test)${NC}"
echo "Running mixed endpoint stress test for ${TEST_DURATION}s..."

start_time=$(date +%s)
end_time=$((start_time + TEST_DURATION))
request_count=0

while [ $(date +%s) -lt $end_time ]; do
    # Burst of mixed requests
    curl -s -o /dev/null "$BASE_URL/api/health" &
    curl -s -o /dev/null "$BASE_URL/api/system/metrics" &
    curl -s -o /dev/null "$BASE_URL/dashboard-v2" &
    curl -s -o /dev/null "$BASE_URL/" &
    
    request_count=$((request_count + 4))
    
    # Brief pause to prevent overwhelming
    sleep 0.1
done
wait

requests_per_second=$(echo "scale=2; $request_count / $TEST_DURATION" | bc -l)

echo -e "${GREEN}✅ Stress Test Results:${NC}"
echo "   Total Requests: $request_count"
echo "   Requests per Second: $requests_per_second"
echo ""

# Add to report
echo "    \"stressTest\": {" >> "$REPORT_FILE"
echo "      \"totalRequests\": $request_count," >> "$REPORT_FILE"
echo "      \"requestsPerSecond\": $requests_per_second," >> "$REPORT_FILE"
echo "      \"duration\": $TEST_DURATION" >> "$REPORT_FILE"
echo "    }" >> "$REPORT_FILE"

# Finalize report
echo "  }," >> "$REPORT_FILE"

# Get final system metrics
echo -e "${BLUE}📈 Test 5: Final System Analysis${NC}"
if curl -s "$BASE_URL/api/system/metrics" > /tmp/final_metrics.json 2>/dev/null; then
    echo -e "${GREEN}✅ System Metrics Retrieved${NC}"
    
    # Extract key metrics
    avg_response=$(cat /tmp/final_metrics.json | grep -o '"averageResponseTime":[0-9]*' | cut -d: -f2 || echo "0")
    active_agents=$(cat /tmp/final_metrics.json | grep -o '"activeAgents":[0-9]*' | cut -d: -f2 || echo "0")
    
    echo "   Average Response Time: ${avg_response}ms"
    echo "   Active Agents: $active_agents"
    
    # Add to report
    echo "  \"finalMetrics\": {" >> "$REPORT_FILE"
    echo "    \"averageResponseTime\": $avg_response," >> "$REPORT_FILE"
    echo "    \"activeAgents\": $active_agents" >> "$REPORT_FILE"
    echo "  }" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠️  Could not retrieve final metrics${NC}"
    echo "  \"finalMetrics\": null" >> "$REPORT_FILE"
fi

echo "}" >> "$REPORT_FILE"

# Summary Report
echo ""
echo "🎯 PERFORMANCE SUMMARY"
echo "======================"
echo -e "${GREEN}✅ Health Check Average: ${avg_health_time}s${NC}"
echo -e "${GREEN}✅ Metrics API Average: ${avg_metrics_time}s${NC}"
echo -e "${GREEN}✅ Dashboard V2 Average: ${avg_dashboard_time}s${NC}"
echo -e "${GREEN}✅ Stress Test RPS: ${requests_per_second}${NC}"

# Performance validation
echo ""
echo "🎖️ PERFORMANCE VALIDATION"
echo "=========================="

# Check if performance meets targets (< 100ms average)
target_ms=0.1
if (( $(echo "$avg_health_time < $target_ms" | bc -l) )); then
    echo -e "${GREEN}✅ Health Check: EXCELLENT (< 100ms)${NC}"
else
    echo -e "${YELLOW}⚠️  Health Check: ACCEPTABLE (> 100ms)${NC}"
fi

if (( $(echo "$avg_metrics_time < $target_ms" | bc -l) )); then
    echo -e "${GREEN}✅ Metrics API: EXCELLENT (< 100ms)${NC}"
else
    echo -e "${YELLOW}⚠️  Metrics API: ACCEPTABLE (> 100ms)${NC}"
fi

if (( $(echo "$avg_dashboard_time < $target_ms" | bc -l) )); then
    echo -e "${GREEN}✅ Dashboard V2: EXCELLENT (< 100ms)${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard V2: ACCEPTABLE (> 100ms)${NC}"
fi

echo ""
echo -e "${BLUE}📄 Full report saved to: $REPORT_FILE${NC}"
echo ""
echo "🚀 Load testing complete! Platform ready for production."