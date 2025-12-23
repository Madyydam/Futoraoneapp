$apiKey = "AIzaSyD0Y9vF_0Vxx4Hf2ESbsreLyPruTVBBeXw"
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"
try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    $models = $response.models | Select-Object name, supportedGenerationMethods
    $models | ConvertTo-Json -Depth 4 | Out-File "final_models_list.json" -Encoding utf8
    Write-Host "Successfully wrote models to final_models_list.json"
} catch {
    Write-Host "Error: $_"
    $_.Exception.Response.GetResponseStream() | %{ [System.IO.StreamReader]::new($_).ReadToEnd() } | Write-Host
}
