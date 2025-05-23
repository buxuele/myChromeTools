from PIL import Image

# 目的  调整图片大小。做 Chrome 插件的时候，需要用到图标。
# 先找2张图片

def resize_image(input_name, out_name, out_width, out_height):
    img = Image.open(input_name)
    out = img.resize((out_width, out_height))
    out.save(out_name)


def convert_to_grayscale(input_path: str, output_path: str):
    """
    将图片转换为灰度图像，并保存到指定路径。

    :param input_path: 输入图片的路径。
    :param output_path: 输出灰度图片的路径。
    """
    image = Image.open(input_path).convert("L")  # 转换为灰度模式
    image.save(output_path)
    print(f"灰度图片已保存至: {output_path}")



if __name__ == "__main__":
    # 1. 先准备一个图片 g1.png
    # 2. 调用函数
    convert_to_grayscale("g1.png", "g2.png")

    # 插件激活状态的图标
    input_image = "g1.png"
    for i in [16, 48, 128]:
        out_image = f"icon{i}_active.png"
        resize_image(input_image, out_image, i, i)


    # 默认转态下的图标
    input_image = "g2.png"
    for i in [16, 48, 128]:
        out_image = f"icon{i}.png"
        resize_image(input_image, out_image, i, i)


