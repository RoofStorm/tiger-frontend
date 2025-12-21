module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Giữ viewBox (rất quan trọng cho responsive)
          removeViewBox: false,

          // Không convert shape sang path (dễ đọc, dễ chỉnh)
          convertShapeToPath: false,

          // Giữ ID (nếu SVG dùng CSS/JS)
          cleanupIds: false,
        },
      },
    },

    // Xóa width/height để SVG responsive
    'removeDimensions',
  ],
};

