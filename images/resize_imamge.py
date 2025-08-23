from PIL import Image

# 目的  调整图片大小。做 Chrome 插件的时候，需要用到图标。

def resize_image(input_name, out_name, out_width, out_height):
    img = Image.open(input_name)
    out = img.resize((out_width, out_height))
    out.save(out_name)


if __name__ == "__main__":
    input_image = "g1.png"
    for i in [16, 48, 128]:
        out_image = f"icon{i}_active.png"
        resize_image(input_image, out_image, i, i)

