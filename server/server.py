from flask import Flask, request, jsonify, send_file, after_this_request
import subprocess
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'image' not in request.files or 'video' not in request.files:
        return jsonify({'error': 'No image or video file'}), 400

    image = request.files['image']
    video = request.files['video']

    image_path = os.path.join(UPLOAD_FOLDER, 'input_image.jpeg')
    video_path = os.path.join(UPLOAD_FOLDER, 'input_video.mp4')
    output_path = os.path.join(OUTPUT_FOLDER, 'swapped_video.mp4')

    image.save(image_path)
    video.save(video_path)

    # Run the face swap script
    subprocess.run([
        'python', 'run.py',
        '-s', image_path,
        '-t', video_path,
        '-o', output_path,
        '--keep-frames', '--keep-fps',
        '--temp-frame-quality', '1',
        '--output-video-quality', '1',
        '--execution-provider', 'cuda',
        '--frame-processor', 'face_swapper', 'face_enhancer'
    ])

    @after_this_request
    def remove_file(response):
        try:
            os.remove(image_path)
            os.remove(video_path)
            os.remove(output_path)
        except Exception as error:
            app.logger.error("Error removing or closing downloaded file handle", error)
        return response

    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
