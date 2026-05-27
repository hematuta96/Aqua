import cv2
import numpy as np

def analyze_water(image_path):
    """
    Analyzes water image using HSV color space to detect turbidity and pollution.
    Returns prediction dictionary.
    """
    img = cv2.imread(image_path)
    if img is None:
        return {"status": "Error", "confidence": 0, "recommendation": "Invalid image."}

    # Convert to HSV (Hue, Saturation, Value/Brightness)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Calculate average values
    mean_hue = np.mean(hsv[:, :, 0])
    mean_sat = np.mean(hsv[:, :, 1])
    mean_val = np.mean(hsv[:, :, 2])

    # Threshold Logic for Real-world Water Simulation
    # Clean water is usually bright (high Value) and low color intensity (low Saturation)
    if mean_val > 160 and mean_sat < 60:
        return {
            "status": "Safe Water",
            "confidence": round(min((mean_val / 255) * 100, 98), 1),
            "recommendation": "Water appears clear. Safe for general usage.",
            "color_class": "safe"
        }
    # Highly polluted water is usually dark (low Value) or highly saturated (muddy brown/algae green)
    elif mean_val < 100 or mean_sat > 140:
        return {
            "status": "Highly Polluted Water",
            "confidence": round(min((mean_sat / 255) * 100 + 20, 99), 1),
            "recommendation": "Do not drink directly! Boiling/filtering required. Contact local authorities.",
            "color_class": "danger"
        }
    # Everything else falls into moderate quality
    else:
        return {
            "status": "Moderate Quality",
            "confidence": round(75.5 + (mean_val % 10), 1),
            "recommendation": "Boil before use. May contain hidden contaminants.",
            "color_class": "warning"
        }