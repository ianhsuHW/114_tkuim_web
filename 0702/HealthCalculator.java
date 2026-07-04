import java.util.Scanner;

public class HealthCalculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("請輸入姓名：");
        String name = sc.nextLine();

        System.out.print("請輸入年齡：");
        int age = sc.nextInt();

        System.out.print("請輸入身高（公尺）：");
        double height = sc.nextDouble();

        System.out.print("請輸入體重（公斤）：");
        double weight = sc.nextDouble();

        double bmi = weight / (height * height);

        System.out.println();
        System.out.println("=== 個人健康資料 ===");
        System.out.println("姓名：" + name);
        System.out.println("年齡：" + age);
        System.out.println("身高：" + height);
        System.out.println("體重：" + weight);
        System.out.println("BMI：" + bmi);

        sc.close();
    }
}
