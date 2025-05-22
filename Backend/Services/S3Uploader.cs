using Amazon.S3;
using Amazon.S3.Transfer;
using Amazon;

public class S3Uploader
{
    private const string bucketName = "algi-startup-uploads"; // ← replace with your real bucket
    private static readonly RegionEndpoint bucketRegion = RegionEndpoint.EUNorth1; // ← update region if needed

    private readonly IAmazonS3 s3Client;

    public S3Uploader()
    {
        var config = new AmazonS3Config
        {
            RegionEndpoint = RegionEndpoint.EUNorth1,
            ForcePathStyle = true // Optional but recommended if hosting on certain services
        };

        s3Client = new AmazonS3Client(
            Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID"),
            Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
            config
        );
    }


    public async Task<string> UploadFileAsync(IFormFile file)
    {
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);

        var fileName = Guid.NewGuid() + "_" + file.FileName;

        var request = new TransferUtilityUploadRequest
        {
            InputStream = stream,
            Key = fileName,
            BucketName = bucketName,
            ContentType = file.ContentType
        };

        var transferUtility = new TransferUtility(s3Client);
        await transferUtility.UploadAsync(request);

        // No public URL, just the key
        return fileName;
    }
}
