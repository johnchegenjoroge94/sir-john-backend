import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CloudinaryService {
  async uploadProductImage(file: Express.Multer.File) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        "Image uploads are not configured on the server.",
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    try {
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "aggies-phone-laptop/products",
            resource_type: "image",
          },
          (error, uploadResult) => {
            if (error) return reject(error);
            if (!uploadResult) {
              return reject(new Error("Cloudinary returned no result."));
            }
            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          },
        );

        stream.end(file.buffer);
      });

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch {
      throw new BadGatewayException(
        "Cloudinary could not upload the image. Please try again.",
      );
    }
  }
}
