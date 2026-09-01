-- Allow Customer Page Background uploads to be registered in media_assets.
-- Keep every existing media type in the check constraint.
ALTER TABLE public.media_assets
  DROP CONSTRAINT IF EXISTS media_assets_media_type_check;

ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_media_type_check
  CHECK (media_type = ANY (ARRAY[
    'STORE_LOGO'::text,
    'STORE_BACKGROUND'::text,
    'PRODUCT_IMAGE'::text,
    'RETAIL_PRODUCT_IMAGE'::text,
    'USER_AVATAR'::text,
    'RIDER_AVATAR'::text,
    'BANNER'::text,
    'ADVERTISEMENT'::text,
    'PROMOTION'::text,
    'PAYMENT_SLIP'::text,
    'DELIVERY_PROOF'::text,
    'IDENTITY_DOCUMENT'::text,
    'LICENSE'::text,
    'VEHICLE_REGISTRATION'::text,
    'INSURANCE'::text,
    'QR_CODE'::text,
    'ADMIN_MEDIA'::text,
    'SYSTEM_MEDIA'::text,
    'CUSTOMER_BACKGROUND'::text
  ]));
