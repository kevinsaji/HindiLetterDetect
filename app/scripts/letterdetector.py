import cv2
import sys
import numpy as np
from skimage.metrics import structural_similarity as ssim

def are_same_letter_ssim(image1_path, image2_path, ssim_threshold):
    """
    Checks if two images of letters show the same letter using Structural Similarity Index (SSIM).
    """
    # Read images
    img1 = cv2.imread(image1_path, cv2.IMREAD_UNCHANGED)
    img2 = cv2.imread(image2_path)

    if img1 is None or img2 is None:
        print("Error: Could not open or find the images.")
        return False, -2.0, None

    # Handle transparency by adding white background to img1
    if img1.shape[2] == 4:  # Check if the image has an alpha channel (RGBA)
        # Create a white background image
        white_background = np.ones_like(img1, dtype=np.uint8) * 255
        
        # Extract alpha channel
        alpha_channel = img1[:,:,3] / 255.0
        
        # Reshape alpha channel for broadcasting
        alpha_channel = np.expand_dims(alpha_channel, axis=2)
        
        # Blend the image with the white background based on alpha
        rgb_channels = img1[:,:,:3]
        img1 = (rgb_channels * alpha_channel + white_background[:,:,:3] * (1 - alpha_channel)).astype(np.uint8)
    
    # If img1 has only 3 channels already, we don't need to do anything special
    elif img1.shape[2] == 3:
        img1 = img1
    
    # Convert images to grayscale (SSIM works on grayscale images)
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # Resize images to have the same dimensions (required for SSIM)
    target_size = (300, 300)  # Standard size for comparison
    gray1 = cv2.resize(gray1, target_size)
    gray2 = cv2.resize(gray2, target_size)

    # Calculate SSIM
    (score, diff) = ssim(gray1, gray2, full=True)
    diff = (diff * 255).astype("uint8")

    print(f"SSIM score: {score:.4f}")

    if score >= float(ssim_threshold):
        print("Are the same letter: YES")
        return True, score, diff
    else:
        print("Are the same letter: NO")
        return False, score, diff

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python letterdetector.py <image1_path> <image2_path> <similarity_threshold>")
        sys.exit(1)
    
    image_path_left = sys.argv[1]
    image_path_right = sys.argv[2]
    similarity_threshold = float(sys.argv[3])
    
    are_same_letter_ssim(image_path_left, image_path_right, similarity_threshold)

