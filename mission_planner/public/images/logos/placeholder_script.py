import os
from PIL import Image, ImageDraw, ImageFont
import sys

# This script generates placeholder logos for the various agencies
# Run with: python placeholder_script.py

def create_placeholder_logo(agency, output_dir):
    """Create a simple placeholder logo for the given agency"""
    # Map agency to colors and text
    agency_data = {
        'police': {
            'bg_color': (0, 56, 168),  # Dark blue
            'text_color': (255, 255, 255),  # White
            'text': 'POLICE'
        },
        'homeland': {
            'bg_color': (0, 51, 102),  # Navy blue
            'text_color': (255, 215, 0),  # Gold
            'text': 'DHS'
        },
        'marshals': {
            'bg_color': (139, 0, 0),  # Dark red
            'text_color': (255, 255, 255),  # White
            'text': 'US MARSHALS'
        },
        'fbi': {
            'bg_color': (0, 0, 0),  # Black
            'text_color': (255, 215, 0),  # Gold
            'text': 'FBI'
        },
        'dea': {
            'bg_color': (0, 100, 0),  # Dark green
            'text_color': (255, 255, 255),  # White
            'text': 'DEA'
        }
    }
    
    if agency not in agency_data:
        print(f"Unknown agency: {agency}")
        return False
    
    # Create a 200x200 image
    img_size = (200, 200)
    img = Image.new('RGB', img_size, color=agency_data[agency]['bg_color'])
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fall back to default if not available
    try:
        font = ImageFont.truetype('arial.ttf', size=40)
    except IOError:
        # Use default font
        font = ImageFont.load_default()
    
    # Add agency text
    text = agency_data[agency]['text']
    text_color = agency_data[agency]['text_color']
    
    # Calculate text position to center it
    text_width, text_height = draw.textsize(text, font=font)
    position = ((img_size[0] - text_width) / 2, (img_size[1] - text_height) / 2)
    
    # Draw text
    draw.text(position, text, fill=text_color, font=font)
    
    # Add a border
    border_width = 5
    draw.rectangle(
        [(0, 0), (img_size[0] - 1, img_size[1] - 1)], 
        outline=text_color, 
        width=border_width
    )
    
    # Save the image
    filename = os.path.join(output_dir, f"placeholder-{agency}.png")
    img.save(filename)
    print(f"Created placeholder logo: {filename}")
    
    return True

def main():
    # Agencies to create placeholders for
    agencies = ['police', 'homeland', 'marshals', 'fbi', 'dea']
    
    # Determine output directory
    output_dir = os.getcwd()  # Default to current directory
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir)
            print(f"Created directory: {output_dir}")
        except OSError as e:
            print(f"Error creating directory: {e}")
            return False
    
    # Create a placeholder for each agency
    for agency in agencies:
        create_placeholder_logo(agency, output_dir)
    
    print("Placeholder logo generation complete")
    return True

if __name__ == "__main__":
    main()
