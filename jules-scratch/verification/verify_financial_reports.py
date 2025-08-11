from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the application
        page.goto("http://127.0.0.1:8080")

        # 2. Go to the "Relatórios" (Reports) page
        page.get_by_role("link", name="Relatórios").click()
        expect(page.get_by_role("heading", name="Relatórios Financeiros")).to_be_visible()

        # 3. Take a screenshot of the "Fluxo de Caixa" (Cash Flow) report
        expect(page.get_by_role("heading", name="Relatório de Fluxo de Caixa")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/fluxo_caixa.png")

        # 4. Switch to the "DRE" (Income Statement) report
        page.get_by_role("link", name="DRE").click()
        expect(page.get_by_role("heading", name="DRE - Demonstrativo de Resultados")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/dre.png")

        # 5. Go to the "Contas a Pagar" (Accounts Payable) page
        page.get_by_role("link", name="Contas a Pagar").click()
        expect(page.get_by_role("heading", name="Contas a Pagar")).to_be_visible()

        # 6. Take a screenshot of the table
        page.screenshot(path="jules-scratch/verification/contas_a_pagar.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
