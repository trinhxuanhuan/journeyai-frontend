[CmdletBinding()]
param(
    [string]$FrontendBaseUrl = "http://localhost:3000",
    [string]$ApiBaseUrl = "http://localhost:8090"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$script:passed = 0

$frontendBase = $FrontendBaseUrl.TrimEnd("/")
$apiBase = $ApiBaseUrl.TrimEnd("/")
$frontendOrigin = ([Uri]$frontendBase).GetLeftPart([UriPartial]::Authority)

function Convert-ResponseContentToText {
    param([object]$Content)

    if ($Content -is [byte[]]) {
        return [Text.Encoding]::UTF8.GetString($Content)
    }

    return [string]$Content
}

function Assert-Check {
    param(
        [bool]$Condition,
        [string]$Name
    )

    if (-not $Condition) {
        throw "FAILED: $Name"
    }

    $script:passed++
    Write-Host "PASS $($script:passed): $Name"
}

function Get-StatusCodeWithoutThrowing {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{}
    )

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Method $Method -Headers $Headers -TimeoutSec 15
        return [int]$response.StatusCode
    } catch {
        if ($null -ne $_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        throw
    }
}

$homeResponse = Invoke-WebRequest -UseBasicParsing -Uri "$frontendBase/" -TimeoutSec 15
$homeContent = Convert-ResponseContentToText $homeResponse.Content
Assert-Check ($homeResponse.StatusCode -eq 200 -and $homeContent.Contains("Việt Khám Phá")) "Frontend và nhận diện thương hiệu sẵn sàng"

$loginResponse = Invoke-WebRequest -UseBasicParsing -Uri "$frontendBase/dang-nhap" -TimeoutSec 15
$loginContentType = @($loginResponse.Headers["Content-Type"]) -join ","
Assert-Check ($loginResponse.StatusCode -eq 200 -and $loginContentType -match "text/html") "Trang đăng nhập sẵn sàng"

$robotsResponse = Invoke-WebRequest -UseBasicParsing -Uri "$frontendBase/robots.txt" -TimeoutSec 15
$robotsContent = Convert-ResponseContentToText $robotsResponse.Content
Assert-Check ($robotsResponse.StatusCode -eq 200 -and $robotsContent.Contains("/sitemap.xml")) "robots.txt trỏ tới sitemap"

$sitemapResponse = Invoke-WebRequest -UseBasicParsing -Uri "$frontendBase/sitemap.xml" -TimeoutSec 15
$sitemapContent = Convert-ResponseContentToText $sitemapResponse.Content
Assert-Check ($sitemapResponse.StatusCode -eq 200 -and $sitemapContent.Contains($frontendOrigin)) "sitemap dùng canonical frontend origin"

$health = Invoke-RestMethod -Uri "$apiBase/actuator/health" -TimeoutSec 15
Assert-Check ($health.status -eq "UP") "API Gateway health UP"

$tourSearch = Invoke-RestMethod -Uri "$apiBase/v1/tours?page=0&size=1" -TimeoutSec 15
Assert-Check ($tourSearch.total -gt 0 -and $tourSearch.items.Count -gt 0) "Public Tour API có dữ liệu"

$tourId = [Uri]::EscapeDataString([string]$tourSearch.items[0].tourId)
$tourDetail = Invoke-RestMethod -Uri "$apiBase/v1/tours/$tourId" -TimeoutSec 15
Assert-Check ($tourDetail.id -and $tourDetail.itinerary.Count -gt 0 -and $tourDetail.included.Count -gt 0) "Tour detail có lịch trình và package"

$tourPageStatus = Get-StatusCodeWithoutThrowing -Uri "$frontendBase/tours/$tourId"
Assert-Check ($tourPageStatus -eq 200) "Frontend Tour detail render thành công"

$corsResponse = Invoke-WebRequest -UseBasicParsing -Uri "$apiBase/v1/tours" -Method OPTIONS -Headers @{
    Origin = $frontendOrigin
    "Access-Control-Request-Method" = "GET"
} -TimeoutSec 15
$allowedOrigin = @($corsResponse.Headers["Access-Control-Allow-Origin"]) -join ","
Assert-Check ($corsResponse.StatusCode -eq 200 -and $allowedOrigin -eq $frontendOrigin) "CORS chỉ phản hồi đúng frontend origin"

$protectedStatus = Get-StatusCodeWithoutThrowing -Uri "$apiBase/v1/bookings"
Assert-Check ($protectedStatus -eq 401) "API được bảo vệ từ chối request không có JWT"

Write-Host "Staging public smoke đạt: $script:passed/10 checks."
