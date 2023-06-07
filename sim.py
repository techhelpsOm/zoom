from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config[
    "UPLOAD_FOLDER"
] = "/path/to/your/upload/directory"  # specify your upload folder


@app.route("/zoom", methods=["GET"])
def zoom_link_endpoint():
    print("call")
    with open("zoom_link.txt", "r") as file:
        zoom_link = file.read().replace("\n", "")
    return jsonify({"zoomLink": zoom_link})


@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected for uploading"}), 400

    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        return jsonify({"message": "File successfully uploaded"}), 200

    return jsonify({"error": "Something went wrong"}), 500


if __name__ == "__main__":
    app.run(port=5000)
