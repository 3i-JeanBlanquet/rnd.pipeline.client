aws s3 ls s3://3i.beamo.tmp --recursive | awk '{print $4}' | grep "features.png" | while read key; do
  aws s3api put-object-acl --bucket "3i.beamo.tmp" --key "$key" --acl public-read
done