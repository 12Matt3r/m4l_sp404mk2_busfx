from playwright.sync_api import sync_playwright, expect
import os

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_path = "file://" + os.path.abspath("web-controller-v3/index.html")
        page.goto(file_path)

        # Wait for the main UI to be ready
        page.wait_for_selector('.map-button')

        # Click the first 'Map' button
        page.click('.map-button[data-knob="1"]')

        # Give the DOM a moment to update
        page.wait_for_timeout(200)

        # Now, check if the modal is visible
        modal = page.locator('#map-modal')
        expect(modal).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_ui()
